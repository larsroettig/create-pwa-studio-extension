### 2.0.2 (2020-10-26)

##### New Features
* allow to use moduleOverrideWebpackPlugin by @Frodigo

#### Improve docs
* new docs for custom template 

##### Bug Fixes
* Default `LICENSE` from npm needs to be removed

### 2.0.0 (2020-10-25)

#### Breaking
* rename `template.json` to `package.json.template`
* support own templates with parameter `--template @yournamespace/template`

##### New Features
* allow to `.template` for files 
* support verbose logging via parameter `-v` 

##### Bug Fixes
* .gitignore was not created for templates
