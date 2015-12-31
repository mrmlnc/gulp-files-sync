'use strict';

var fs = require('fs');
var gutil = require('gulp-util');
var arrayFindIndex = require('array-find-index');
var slash = require('slash');

/**
 * Adding the final slash
 *
 * @param {String} filepath
 */
module.exports.lastSlash = function(filepath) {
  if (filepath[filepath.length - 1] === '/') {
    return filepath;
  }

  return filepath + '/';
};

/**
 * Test whether the given path is a file
 *
 * @param {String} filepath
 */
module.exports.isFile = function(filepath) {
  return fs.statSync(filepath).isFile();
};

/**
 * Test whether the given path is a directory
 *
 * @param {String} filepath
 */
module.exports.isDirectory = function(filepath) {
  return fs.statSync(filepath).isDirectory();
};

/**
 * Test whether or not the given path exists by checking with the file system
 *
 * @param {String} filepath
 */
module.exports.existsSync = function(filepath) {
  var result = true;
  try {
    fs.statSync(filepath);
  } catch (error) {
    result = false;
  }

  return result;
};

/**
 * Test whether there is a file in the source directory
 *
 * @param {Array} src
 * @param {String} filepath
 */
var findInArray = function(src, filepath) {
  return arrayFindIndex(src, function(item) {
    return item === slash(filepath);
  });
};

module.exports.findInArray = findInArray;

/**
 * Test whether need to ignore this file
 *
 * @param {Array} ignore
 * @param {String} filepath
 */
module.exports.isIgnored = function(ignore, filepath) {
  if (ignore) {
    return !(findInArray(ignore, filepath) + 1);
  }

  return true;
};

/**
 * Displays information about work
 *
 * @param {String} src
 * @param {String} dest
 * @param {String} status
 */
module.exports.verbose = function(src, dest, status) {
  src = gutil.colors.cyan(slash(src));
  dest = gutil.colors.cyan(slash(dest));
  if (status === 'created') {
    gutil.log('Copying ' + src + ' -> ' + dest);
  } else if (status === 'updated') {
    gutil.log('Overwriting ' + dest + ' because type differs.');
  } else if (status === 'removed') {
    gutil.log('Removing file ' + dest + ' because not longer in src.');
  }
};

/**
 * Displays information about changes
 *
 * @param {Object} stat
 */
module.exports.printSummary = function(stat) {
  stat.created = gutil.colors.green(stat.created) + ' files created, ';
  stat.removed = gutil.colors.red(stat.removed) + ' files removed, ';
  stat.updated = gutil.colors.blue(stat.updated) + ' files updated, ';
  stat.passed = gutil.colors.cyan(stat.passed) + ' files passed';
  gutil.log('gulp-files-sync', stat.created + stat.removed + stat.updated + stat.passed);
};
