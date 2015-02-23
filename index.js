#!/usr/bin/env node

var chalk = require('chalk');
var cheerio = require('cheerio');
var lodash = require('lodash');
var npm = require('npm');
var request = require('request');

npm.load();
var modules = [];
console.log('processing your dependencies...');
request.get('https://github.com/iojs/io.js/issues/456', function(err, res) {
  if (err) {
    throw err;
  }

  var $ = cheerio.load(res.body);
  // get a list of all repos who have open issues pointing to iojs/io.js#456
  var repos = $('div')
  .filter(function(i, el) {
    return $(this).attr('class') === 'discussion-item-rollup-ref' &&
           $(this).children().first().attr('class') === 'state state-open right';
  })
  .map(function(i, el) {
      var link = $(this).find('a').attr('href');
      return link.slice(0, link.indexOf('/issues'));
  })
  .get();

  // remove dups
  repos = lodash.uniq(repos);

  var names = [];

  // resolve package name from github repo by reading `package.json`
  repos.forEach(function(name) {
    request.get('https://raw.githubusercontent.com' + name + '/master/package.json', function(err, res) {
      if (err) {
        throw err;
      }
      names.push(JSON.parse(res.body).name);
      // check if we covered all repositories on the list
      if (names.length === repos.length) {
        // traverse local npm modules to see if we have a problematic package from the list
        npm.commands.ls(null, {silent: true}, function(err, obj) {
          find_deps(obj);
          var conflicting = modules.filter(function(m) {
            return names.indexOf(m.name) !== -1;
          });
          if (conflicting.length) {
            console.log('The following dependencies might not work with io.js:');
            conflicting.forEach(function(m) {
              // console.log(chalk.cyan(m.name), ':', m.path.substring(process.cwd().length + 1, m.path.length));
              console.log(chalk.cyan(m.name), ':', m.path.split('node_modules/').slice(1).join(' --> ').replace(/\//g, ''));
            });
          } else {
            console.log('Your dependencies look okay from here');
          }
        });
      }
    });
  });
});


// recursively traverse dependency tree and collect dependencies
function find_deps(node) {
  modules.push({name: node.name, path: node.path});
  var deps = node.dependencies;
  Object.keys(deps).forEach(function(dep) {
    find_deps(deps[dep]);
  });
}