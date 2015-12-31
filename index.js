'use strict';

var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var objectAssign = require('object-assign');
var globby = require('globby');
var hasGlob = require('has-glob');

var utils = require('./lib/utils');
var sync = require('./lib/sync');

var plugin = function(src, dest, options) {
  dest = utils.lastSlash(dest);
  options = objectAssign({
    cwd: process.cwd(),
    updateAndDelete: true,
    verbose: false,
    ignoreInDest: false
  }, options);
  var stat = { created: 0, removed: 0, updated: 0, passed: 0 };

  return through.obj(function(file, encoding, cb) {
    this.push(file);
    cb();
  }, function(cb) {
    if (!src || !dest) {
      cb(new gutil.PluginError('gulp-files-sync', 'Give the source directory and target directory'));
      return;
    }

    // Copying and updating files
    var arrayOfSrcFiles = globby.sync(src, options);
    if (arrayOfSrcFiles.length) {
      // If `src` is a Glob, then delete the directory from array
      if (hasGlob(src)) {
        arrayOfSrcFiles = arrayOfSrcFiles
          .filter(function(filepath) {
            return !utils.isDirectory(filepath);
          });
      }

      // Synchronization of files in directories
      arrayOfSrcFiles
        .forEach(function(filepath) {
          var baseSrc = filepath;
          if (options.base) {
            baseSrc = path.relative(options.base, filepath);
          }

          var baseDest = path.join(dest, baseSrc);
          sync.sync(filepath, baseDest, options, stat);
        });
    }

    // If there is a need to ignore files in the destination directory
    if (options.ignoreInDest) {
      options.ignoreInDest = globby.sync(options.ignoreInDest, {
        cwd: path.join(process.cwd(), dest)
      });
    }

    // Delete unnecessary files from the destination directory
    if (!Array.isArray(src)) {
      src = src.split();
    }

    src.forEach(function(filepath) {
      sync.remove(filepath, dest, options, stat, dest);
    });

    // Displays information about changes
    if (options.printSummary) {
      if (typeof options.printSummary === 'function') {
        options.printSummary(stat);
        return;
      }

      utils.printSummary(stat);
    }

    cb();
  });
};

module.exports = plugin;
