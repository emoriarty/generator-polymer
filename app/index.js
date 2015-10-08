'use strict';
var yeoman = require('yeoman-generator');
var path = require('path');
var yosay = require('yosay');
var chalk = require('chalk');
var cordova = require('cordova-lib').cordova.raw; // get the promise version of all methods
var fs = require('fs');

// local modules
var utils = require('../util-cordova.js');
var cordovaConfig = require('./sources/cordova-config.js');

module.exports = yeoman.generators.Base.extend({
  initializing: function () {
    // get package.json content
    this.pkg = require('../package.json');
    // non-empty dir?
    this.fileCount = fs.readdirSync('.').length;
    // read .yo-rc
    this.answers = this.config.getAll().answers;
    // is update?
    this.update = this.answers ? true : false;

    // abort when directory is not empty on first run
    if (!this.update && this.fileCount > 0) {
      this.log(chalk.red('Non-empty directory. Cordova needs an empty directory to set up project'));
      process.exit(1);
    }
  },
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    this.option('skip-install', {
      desc:     'Whether dependencies should be installed',
      defaults: false
    });

    this.option('skip-install-message', {
      desc:     'Whether commands run should be shown',
      defaults: false
    });

    this.sourceRoot(path.join(path.dirname(this.resolved), 'templates/polymer-cordova-starter-kit'));
  },
  askFor: function () {
    if (this.update) {
      return;
    }

    // say hello
    if (!this.options['skip-welcome-message']) { // for use with generator-m-server
      this.log(yosay(
        'Welcome to the Polymer generator flavored with Cordova! v.' + this.pkg.version + '\nOut of the box I include Polymer Cordova Starter Kit'
      ));
    }

    // Set appName when generator was called with `--appName=HelloApp`
    if (this.options['app-name']) {
      this.appName = this.options['app-name'];
    }

    var done = this.async();

    var prompts = [
      // appName
      {
        type: 'input',
        name: 'appName',
        message: 'state a name for your project (this name will be displayed below the app icon)',
        validate: utils.validateAppName,
        when: function () {
          // Show this prompt only if appName is not already set
          return !this.appName;
        }.bind(this)
      },
      // appId
      {
        type: 'input',
        name: 'appId',
        message: 'state a bundle identifier for your project (e.g. com.company.project)',
        validate: utils.validateAppId
      },
      // web component tester
      {
        name: 'includeWCT',
        message: 'Would you like to include web-component-tester?',
        type: 'confirm'
      },
      // recipes
      {
        name: 'includeRecipes',
        message: 'Would you like to include recipe docs?',
        type: 'confirm',
        default: false
      },
      // select platforms
      {
        type: 'checkbox',
        name: 'platforms',
        message: 'Select all platforms you want to support:',
        choices: cordovaConfig.platforms
      },
      // select plugins
      {
        type: 'checkbox',
        name: 'plugins',
        message: 'Select all cordova plugins you want to install',
        choices: cordovaConfig.plugins
      }
    ];

    this.prompt(prompts, function (answers) {
      this.includeWCT = answers.includeWCT;
      this.includeRecipes = answers.includeRecipes;
      this.appName = answers.appName;
      this.appId = answers.appId;
      this.platforms = answers.platforms;
      this.plugins = answers.plugins;
      done();
    }.bind(this));
  },
  cordova: function () {
    if (this.update) {
      return true;
    }

    var done = this.async(); // wait with subsequent tasks since cordova needs an empty folder
    // cordova project
    cordova.create('.', this.appId, this.appName)
    // add platforms and save to config.xml
    .then(function () {
      this.log(chalk.green('Created cordova project'));
      this.log(this.platforms);
      this.log(this.plugins);
      if (this.options['skip-sdk'] || !this.platforms.length) {
        return true;
      }
      else {
        return cordova.platform('add', this.platforms, { save: true });
      }
    }.bind(this))
    // add plugins and save to config.xml
    .then(function () {
      this.log(chalk.green('Added platforms: ' + this.platforms.join(', ')));
      if (this.options['skip-sdk'] || !this.plugins.length) {
        return true;
      }
      else {
        return cordova.plugin('add', this.plugins, { save: true });
      }
    }.bind(this))
    // all
    .then(function () {
      this.log(chalk.green('Added plugins: ' + this.plugins.join(', ')));
      this.log(chalk.green('Cordova project was set up successfully! Project Name: '), chalk.bgGreen(this.appName));
      done();
    }.bind(this))
    .catch(function (err) {
      this.log(chalk.red('Couldn\'t finish generator: \n' + err));
      process.exit(1);
    }.bind(this));
  },
  app: function () {
    this.copy('.editorconfig', '.editorconfig');
    this.copy('.gitattributes', '.gitattributes');

    // Handle bug where npm has renamed .gitignore to .npmignore
    // https://github.com/npm/npm/issues/3763
    if (this.src.isFile('.npmignore')) {
      this.copy('.npmignore', '.gitignore');
    } else {
      this.copy('.gitignore', '.gitignore');
    }
    this.copy('.jscsrc', '.jscsrc');
    this.copy('.jshintrc', '.jshintrc');

    this.copy('bower.json', 'bower.json', function(file) {
      var manifest =  JSON.parse(file);
      if (!this.includeWCT) {
        delete manifest.devDependencies['web-component-tester'];
        delete manifest.devDependencies['test-fixture'];
      }
      return JSON.stringify(manifest, null, 2);
    }.bind(this));

    this.copy('gulpfile.js', 'gulpfile.js', function(file) {
      var clone = file;
      if (!this.includeWCT) {
        clone = file.replace(/require\('web-component-tester'\).+/g,
          function(match) {
            return '// ' + match;
          });
      }
      return clone;
    }.bind(this));

    this.copy('LICENSE.md', 'LICENSE.md');

    // Remove WCT if the user opted out
    this.copy('package.json', 'package.json', function(file) {
      var manifest =  JSON.parse(file);
      if (!this.includeWCT) {
        delete manifest.devDependencies['web-component-tester'];
      }
      return JSON.stringify(manifest, null, 2);
    }.bind(this));

    this.copy('README.md', 'README.md');

    if (this.includeWCT) {
      this.copy('wct.conf.js', 'wct.conf.js');
      this.directory('test', 'test');
    }

    this.mkdir('app');
    this.directory('app', 'app');

    this.mkdir('gulp');
    this.directory('gulp', 'gulp');

    if (this.includeRecipes) {
      this.directory('docs', 'docs');
    }
  },
  install: function () {
    this.installDependencies({
      skipInstall: this.options['skip-install'],
      skipMessage: this.options['skip-install-message']
    });
  }
});
