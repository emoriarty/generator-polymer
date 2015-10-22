/*global describe, beforeEach, before, it*/

var path    = require('path');
var helpers = require('yeoman-generator').test;
var assert  = require('yeoman-generator').assert;
var _       = require('lodash');

var prompts = {
      appName: 'test',
      appId: 'com.company.test',
      includeWCT: true,
      includeRecipes: false,
      platforms: ['ios', 'android'],
      plugins: ['cordova-plugin-device']
    },
    args = [
      '--skip-install',
      '--skip-sdk'
    ];

describe('yo polymer-cordova:app', function() {

  describe('yo polymer-cordova:app with WCT test', function () {

    before(function (done) {
      helpers.run(path.join(__dirname, '../app'))
        .inDir(path.join(__dirname, './tmp'))
        .withArguments(args)
        .withPrompts(prompts)
        .on('end', done);
    });

    it('creates expected files', function () {
      var expected = [
        '.editorconfig',
        '.gitattributes',
        '.gitignore',
        '.jscsrc',
        '.jshintrc',
        'bower.json',
        'gulpfile.js',
        'LICENSE.md',
        'package.json',
        'README.md',
        'wct.conf.js',
        'app',
        //Cordova files
        'config.xml'
      ];

      assert.file(expected);
    });

    it('includes WCT', function() {
      assert.fileContent('bower.json', /web-component-tester/gm);
      assert.fileContent('bower.json', /test-fixture/gm);
      assert.fileContent('package.json', /web-component-tester/gm);
      assert.fileContent('gulpfile.js', /^require\('web-component-tester'\).+/gm);
    });

    it('has proper cordova files content', function () {
      assert.fileContent([
        ['config.xml', '<widget id="' + prompts.appId + '"'],
        ['config.xml', '<name>' + prompts.appName + '</name>']
      ]);
    });
  });

  describe('yo polymer-cordova:app without WCT test', function () {

    before(function (done) {
      helpers.run(path.join(__dirname, '../app'))
        .inDir(path.join(__dirname, './tmp'))
        .withArguments(args)
        .withPrompts(_.extend({}, prompts, {
          includeWCT: false,
          includeRecipes: true}))
        .on('end', done);
    });

    it('creates expected files', function () {
      var expected = [
        '.editorconfig',
        '.gitattributes',
        '.gitignore',
        '.jscsrc',
        '.jshintrc',
        'bower.json',
        'gulpfile.js',
        'LICENSE.md',
        'package.json',
        'README.md',
        'app',
        //Cordova files
        'config.xml'
      ];

      assert.file(expected);
    });

    it('does not include WCT', function() {
      assert.noFileContent('bower.json', /web-component-tester/gm);
      assert.noFileContent('bower.json', /test-fixture/gm);
      assert.noFileContent('package.json', /web-component-tester/gm);
      assert.fileContent(
        'gulpfile.js', /^\/\/\srequire\('web-component-tester'\).+/gm
      );
    });

  });

  describe('yo polymer-cordova:app with Recipes test', function () {

    before(function (done) {
      helpers.run(path.join(__dirname, '../app'))
        .inDir(path.join(__dirname, './tmp'))
        .withArguments(args)
        .withPrompts(_.extend({}, prompts, {
          includeWCT: false,
          includeRecipes: true}))
        .on('end', done);
    });

    it('creates expected files', function () {
      var expected = [
        '.editorconfig',
        '.gitattributes',
        '.gitignore',
        '.jscsrc',
        '.jshintrc',
        'bower.json',
        'gulpfile.js',
        'LICENSE.md',
        'package.json',
        'README.md',
        'app',
        'docs',
        //Cordova files
        'config.xml'
      ];

      assert.file(expected);
    });

  });


  describe('yo polymer-cordova:app without Recipes test', function () {

    before(function (done) {
      helpers.run(path.join(__dirname, '../app'))
        .inDir(path.join(__dirname, './tmp'))
        .withArguments(args)
        .withPrompts(_.extend({}, prompts, {
          includeWCT: false,
          includeRecipes: false}))
        .on('end', done);
    });

    it('creates expected files', function () {
      var expected = [
        '.editorconfig',
        '.gitattributes',
        '.gitignore',
        '.jscsrc',
        '.jshintrc',
        'bower.json',
        'gulpfile.js',
        'LICENSE.md',
        'package.json',
        'README.md',
        'app',
        //Cordova files
        'config.xml'
      ];

      assert.file(expected);
      assert.noFile(['docs']);
    });

  });

});
