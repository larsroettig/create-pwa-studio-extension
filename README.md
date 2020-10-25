<p align="center">
  <img src="https://raw.githubusercontent.com/larsroettig/create-pwa-studio-extension/main/static/starter_img.jpg">
</p>


# PWA Studio extension generator 

An extension generator for Magento PWA Studio includes all you need to build an amazing extension

- 📏 **ESLint** - JavaScript linter
- 💖 **Prettier** - Opinionated Code Formatter
- 📄 **Jest** - Setup React Testing Library
    - 🦉 **@testing-library/jest-dom** - Custom jest matchers the state of the DOM
    - 🐏 **@testing-library/react-hooks** - React hooks testing utilities that encourage good testing practices
- 🐶 **Husky** - Use git hooks with ease
- ⚡  **Automatically installs project's peer dependencies** - 
- 🗂 **Basic Module structure**

## 🚀 Getting started

```bash
yarn create @larsroettig/pwa-extension 
```

```bash
npm init @magento/pwa
```

 Parameter |  Description  | 
|----------|:-------------:|
| --template @yournamespace/template | custom template for code generator | 
| -v       | enable verbose log for code generator |  

<p align="center">
  <img src="https://raw.githubusercontent.com/larsroettig/create-pwa-studio-extension/main/static/console.png">
</p>

## Create your own templates
Via a parameter, you can define your own template  `--template @yournamespace/template`  
The code generator will copy any file from a node package. It solves and
download packages via `npm view --json ${packageName}` for it should work for a private repository as well. 

My starter template you can find here:
https://github.com/larsroettig/create-pwa-studio-extension/tree/main/packages/cpse-template

A minimal template need the following files:
**package.json**
```
{
  "name": "@your-name/cpse-template",
  "author": "your-name <your-mail@domain.tdl>",
  "version": "2.0.0",
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  }
}
```

**package.json.template**
```
{
  "name": "@larsroettig/pwa-extension-template",
  "author": "Lars Roettig <hello@larsroettig.de>",
  "version": "0.0.0",
  "main": "src/index.js",
}
```

**.gitignore.template**
```
node_modules
```