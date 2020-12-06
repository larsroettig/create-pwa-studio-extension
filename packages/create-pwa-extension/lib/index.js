#!/usr/bin/env node
/* eslint-disable no-console */

const { resolve } = require('path');
const os = require('os');
const prompts = require('prompts');
const chalk = require('chalk');
const gitUserInfo = require('git-user-info');
const isInvalidPath = require('is-invalid-path');
const isValidNpmName = require('is-valid-npm-name');
const minimist = require('minimist');
const pkg = require('../package.json');

const opts = minimist(process.argv.slice(2));
const create = require('./create-pwa-extension');

module.exports = async () => {
  console.log(chalk.greenBright(`${pkg.name} v${pkg.version}`));
  console.log(
    chalk.white(`Creating a ${chalk.whiteBright('PWA Studio')} extension`),
  );

  const userAgent = process.env.npm_config_user_agent || '';
  const isYarn = userAgent.includes('yarn');
  let answers;
  const questions = [
    {
      name: 'directory',
      type: 'text',
      message: 'Project root directory (will be created if it does not exist)',
      validate: (dir) => {
        if (!dir) {
          return 'Please enter a directory path';
        }
        return isInvalidPath(dir) ? 'Invalid directory path; contains illegal characters' : true;
      },
    },
    {
      name: 'name',
      type: 'text',
      message:
                'Short name of the project to put in the package.json "name" field',
      validate: isValidNpmName,
      initial: (prev) => prev,
    },
    {
      name: 'author',
      type: 'text',
      message: 'Name of the author to put in the package.json "author" field',
      initial: () => {
        const userInfo = os.userInfo();
        let author = userInfo.username;
        const gitInfo = gitUserInfo({
          path: resolve(userInfo.homedir, '.gitconfig'),
        });

        if (gitInfo) {
          author = gitInfo.name || author;
          if (gitInfo.email) {
            author += ` <${gitInfo.email}>`;
          }
        }
        return author;
      },
    },
    {
      name: 'npmClient',
      type: 'list',
      message: 'NPM package management client to use',
      choices: ['npm', 'yarn'],
      initial: isYarn ? 'yarn' : 'npm',
    },
    {
      name: 'install',
      type: 'confirm',
      message: ({ npmClient }) => `Install package dependencies with ${npmClient} after creating project`,
      initial: true,
    },
  ];

  try {
    answers = await prompts(questions);
  } catch (e) {
    console.error('App creation cancelled.');
  }

  answers.template = opts.template
    ? opts.template
    : '@larsroettig/cpse-template';
  answers.logLevel = opts.v ? 'debug' : 'info';
  answers.download = !!opts.d;
  create(answers);
};
