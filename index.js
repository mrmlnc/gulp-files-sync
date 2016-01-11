'use strict';

// Node.js
var path = require('path');
var fs = require('fs');
// Gulp
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var log = gutil.log;
var chalk = gutil.colors;
// Module
var Promise = require('promise');
var statP = Promise.denodeify(fs.stat);
var rimrafP = Promise.denodeify(require('rimraf'));
var objectAssign = require('object-assign');
var globby = require('globby');
var globParent = require('glob-parent');
var cpf = require('cp-file');
var arrayDiffer = require('array-differ');
// Utilites for files
var files = require('./lib/files');

var PLUGIN_NAME = 'gulp-files-sync';

var plugin = function(src, dest, options) {
  var opts = objectAssign({
    cwd: process.cwd(),
    updateAndDelete: true,
    verbose: false,
    ignoreInDest: false
  }, options);

  return through.obj(function(file, encoding, cb) {
    this.push(file);
    cb();
  }, function(cb) {
    var _that = this;
    if (!src || !dest) {
      cb(new PluginError(PLUGIN_NAME, 'Give the source directory and target directory'));
      return;
    }

    // If `verbose` mode is enabled
    log = (opts.verbose) ? log : function() {};

    // Remove latest slash for base path
    if (opts.base && opts.base.slice(-1) === '/') {
      opts.base = opts.base.slice(0, -1);
    }

    // If destination directory not exists create it
    if (!files.existsStatSync(dest)) {
      require('mkdirp').sync(dest);
    }

    // Settings for globby
    var globPromises = [
      globby(src, { dot: true, nosort: true }),
      globby(path.join(dest, '**'), {
        dot: true,
        nosort: true,
        ignore: opts.ignoreInDest
      })
    ];

    Promise.all(globPromises)
      .then(function(results) {
        // Deleting files
        if (opts.updateAndDelete) {
          // Create a full list of the basic directories
          var basePaths = [''];
          src.forEach(function(srcGlob) {
            var baseDir = files.expandDirTree(globParent(srcGlob));
            basePaths = basePaths.concat(baseDir);
          });

          // Compute path to source directory for each file
          results[1] = results[1].map(function(destPath) {
            return files.fromDestToSrcPath(destPath, dest, opts);
          });

          // Search unique files to the destination directory
          // To files in the source directory are added paths to basic directories
          results[1] = arrayDiffer(results[1], results[0].concat(basePaths));

          // Creating promises to delete files
          results[1] = results[1].map(function(destPath) {
            var fullpath = files.fromSrcToDestPath(destPath, dest, opts);
            return rimrafP(fullpath, { glob: false })
              .then(log(chalk.red('Removing: ') + fullpath));
          });
        }

        // Copying files
        results[0] = results[0].map(function(srcPath) {
          var to = files.fromSrcToDestPath(srcPath, dest, opts);
          var statSrc = statP(srcPath);
          var statDest = statP(to).catch(function() {});
          return Promise.all([statSrc, statDest]).then(function(stats) {
            // Update file?
            if (!opts.updateAndDelete || stats[0].isDirectory() ||
              stats[1] && (stats[0].ctime.getTime() <= stats[1].ctime.getTime())) {
              return false;
            }

            return cpf(srcPath, to)
              // Display log messages when copying files
              .then(log(chalk.green('Copying: ') + srcPath + chalk.cyan(' -> ') + to))
              .catch(function(err) {
                cb(new PluginError(PLUGIN_NAME, 'Cannot copy from `' + srcPath + '` to `' + to + '`: ' + err.message));
                return;
              });
          });
        });

        // Flatten nested array.
        return Promise.all(results.reduce(function(a, b) {
          return a.concat(b);
        }));
      })
      .then(function() {
        _that.resume();
        cb();
      })
      .catch(function(err) {
        cb(new PluginError(PLUGIN_NAME, err));
        return;
      });
  });
};

module.exports = plugin;
