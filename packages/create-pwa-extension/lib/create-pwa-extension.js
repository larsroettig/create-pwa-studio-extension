const { resolve } = require("path");
const fetch = require("node-fetch");
const tar = require("tar");
const os = require("os");
const execa = require("execa");
const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const glob = require("glob");
const { createLogger, format, transports } = require("winston");

const tmpDir = os.tmpdir();

const logger = createLogger({
  format: format.combine(format.splat(), format.simple()),
  transports: [new transports.Console()]
});

const templateAliases = {
  "@larsroettig/cpse-template": {
    npm: "@larsroettig/cpse-template",
    dir: resolve(__dirname, "../../cpse-template")
  }
};

async function makeDirFromNpmPackage(packageName) {
  const packageDir = resolve(tmpDir, packageName);
  // NPM extracts a tarball to './package'
  const packageRoot = resolve(packageDir, "package");
  try {
    if ((await fse.readdir(packageRoot)).includes("package.json")) {
      logger.debug(`Found ${packageName} template in cache`);
      return packageRoot;
    }
  } catch (e) {
    // Not cached.
  }
  let tarballUrl;
  try {
    logger.info(`Finding ${packageName} tarball on NPM`);
    tarballUrl = JSON.parse(
      execa.commandSync(`npm view --json ${packageName}`, {
        encoding: "utf-8"
      }).stdout
    ).dist.tarball;
  } catch (e) {
    throw new Error(
      `Invalid template: could not get tarball url from npm: ${e.message}`
    );
  }

  let tarballStream;
  try {
    logger.info(`Downloading and unpacking ${tarballUrl}`);
    tarballStream = (await fetch(tarballUrl)).body;
  } catch (e) {
    throw new Error(
      `Invalid template: could not download tarball from NPM: ${e.message}`
    );
  }

  await fse.ensureDir(packageDir);
  return new Promise((res, rej) => {
    const untarStream = tar.extract({
      cwd: packageDir
    });
    tarballStream.pipe(untarStream);
    untarStream.on("finish", () => {
      logger.info(`Unpacked ${packageName}`);
      res(packageRoot);
    });
    untarStream.on("error", rej);
    tarballStream.on("error", rej);
  });
}
async function findTemplateDir(templateName) {
  const template = templateAliases[templateName] || {
    npm: templateName,
    dir: templateName
  };
  try {
    await fse.readdir(template.dir);
    logger.debug(`Found ${templateName} directory`);
    // if that succeeded, then...
    return template.dir;
  } catch (e) {
    return makeDirFromNpmPackage(template.npm);
  }
}

function fixJSON(file, key, value) {
  try {
    logger.debug(`Try Change ${key} in ${file} to ${value}`);
    const json = JSON.parse(fs.readFileSync(file));
    json[key] = value;
    fs.writeFileSync(file, JSON.stringify(json, null, "  "));
    logger.debug(`Successfully Change ${key} in ${file} to ${value}`);
  } catch (e) {
    logger.error("Error: Cannot fix the JSON", file, key, value);
  }
}

function copyTemplates(directory) {
  const files = glob.sync("**/*.template", { cwd: directory });
  files.forEach(template => {
    const templatePath = path.join(directory, template);
    const filePath = templatePath
      .split(".")
      .slice(0, -1)
      .join(".");
    fse.copySync(templatePath, filePath);
    fse.remove(templatePath);
  });
}

module.exports = async params => {
  const { directory, name, author, template, logLevel } = params;
  logger.level = logLevel;
  logger.info(`Creating a new PWA extension '${name}' in ${directory}`);
  logger.debug(`Params: ${JSON.stringify(params)}`);

  const templateDir = await findTemplateDir(template);
  await fse.copySync(templateDir, directory);
  copyTemplates(directory);

  const directoryPath = path.join(process.cwd(), directory);
  fixJSON(`${directoryPath}/package.json`, "name", name);
  fixJSON(`${directoryPath}/package.json`, "author", author);

  // Install the project if instructed to do so.
  if (params.install) {
    await execa.command(`${params.npmClient} install`, {
      cwd: directoryPath,
      stdio: "inherit"
    });
    logger.debug(`Installed dependencies for '${name}' project`);
  }

  logger.info(`Success created '${name}' in ${directoryPath}`);
};
