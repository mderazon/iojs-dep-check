#!/usr/bin/env node

var cheerio = require('cheerio');
var lodash = require('lodash');
var npm = require('npm');
var request = require('request');

npm.load();
var modules = [];

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
      if (names.length === repos.length) {
        // do stuff
        npm.commands.ls(null, {silent: true}, function(err, obj) {
          find_deps(obj);
          modules = lodash.uniq(modules);
          names = lodash.intersection(modules, names);
          if (names[0]) {
            console.log('The following dependencies will not work with io.js:', names);
          } else {
            console.log('Your dependencies looks okay from here');
          }
        });
      }
    });
    
  });
  
});


// recursively traverse dependency tree and collect dependencies
function find_deps(node) {
  modules.push(node.name);
  var deps = node.dependencies;
  Object.keys(deps).forEach(function(dep) {
    find_deps(deps[dep]);
  });
}