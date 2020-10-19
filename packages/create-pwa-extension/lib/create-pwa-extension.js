const {resolve} = require('path');
const fetch = require("node-fetch");
const tar = require('tar');
const os = require('os');
const execa = require('execa');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path')

const tmpDir = os.tmpdir();

const templateAliases = {
    'pwa-studio-extension-starter': {
        npm: '@larsroettig/pwa-extension-template',
        dir: resolve(__dirname, '../../pwa-extension-template')
    }
};

async function makeDirFromNpmPackage(packageName) {
    const packageDir = resolve(tmpDir, packageName);
    // NPM extracts a tarball to './package'
    const packageRoot = resolve(packageDir, 'package');
    try {
        if ((await fse.readdir(packageRoot)).includes('package.json')) {
            console.log(`Found ${packageName} template in cache`);
            return packageRoot;
        }
    } catch (e) {
        // Not cached.
    }
    let tarballUrl;
    try {
        console.log(`Finding ${packageName} tarball on NPM`);
        tarballUrl = JSON.parse(
            execa.commandSync(`npm view --json ${packageName}`, {
                encoding: 'utf-8'
            }).stdout
        ).dist.tarball;
    } catch (e) {
        throw new Error(
            `Invalid template: could not get tarball url from npm: ${e.message}`
        );
    }

    let tarballStream;
    try {
        console.log(`Downloading and unpacking ${tarballUrl}`);
        tarballStream = (await fetch(tarballUrl)).body;
    } catch (e) {
        throw new Error(
            `Invalid template: could not download tarball from NPM: ${
                e.message
            }`
        );
    }

    await fse.ensureDir(packageDir);
    return new Promise((res, rej) => {
        const untarStream = tar.extract({
            cwd: packageDir
        });
        tarballStream.pipe(untarStream);
        untarStream.on('finish', () => {
            console.log(`Unpacked ${packageName}`);
            res(packageRoot);
        });
        untarStream.on('error', rej);
        tarballStream.on('error', rej);
    });
}

async function findTemplateDir(templateName) {
    const template = templateAliases[templateName] || {
        npm: templateName,
        dir: templateName
    };
    try {
        await fse.readdir(template.dir);
        console.log(`Found ${templateName} directory`);
        // if that succeeded, then...
        return template.dir;
    } catch (e) {
        return makeDirFromNpmPackage(template.npm);
    }
}

async function fixJSON(file, key, value) {
    try {
        const json = JSON.parse(fs.readFileSync(file));
        json[key] = value;
        fs.writeFileSync(file, JSON.stringify(json, null, "  "));
        console.log('Fix:', file, 'Key:', key);
    } catch (e) {
        console.log('Error: Cannot fix the JSON', file, key, value);
    }
}

module.exports = async params => {
    const {directory, name, author} = params;
    const template = await findTemplateDir('pwa-studio-extension-starter')

    console.log(`Creating a new PWA extension '${name}' in ${directory}`);

    await fse.copySync(template, directory);
    await fse.copySync(directory+'/template.json', directory+'/package.json');

    const directoryPath = path.join(process.cwd(),directory);
    await fixJSON(directoryPath + '/package.json', "name", name)
    await fixJSON(directoryPath + '/package.json', "author", author)

    // Install the project if instructed to do so.
    if (params.install) {
        await execa.command(`${params.npmClient} install`, {
            cwd: directoryPath,
            stdio: 'inherit'
        });
        console.log(`Installed dependencies for '${name}' project`);
    }

    console.log(`Success created '${name}' in ${directoryPath}`);
}