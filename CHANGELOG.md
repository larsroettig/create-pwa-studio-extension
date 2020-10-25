### 2.0.0 (2020-10-25)

#### Breaking
* rename `template.json` to `package.json.template`
* support own templates with parameter `--template @yournamespace/template`

##### New Features
* allow to `.template` for files 
* support verbose logging via parameter `-v` 

##### Bug Fixes
* .gitignore was not created for templates
