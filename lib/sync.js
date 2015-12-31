'use strict';

var path = require('path');
var fs = require('fs-extra');
var utils = require('./utils');

/**
 * Deleting unnecessary files
 *
 * @param {Array|String} src
 * @param {String} dest
 * @param {Object} options
 * @param {Object} stat
 * @param {String} originalDest
 */
var remove = function(src, dest, options, stat, originalDest) {
  if (options.updateAndDelete && utils.existsSync(dest)) {
    var statDest = fs.statSync(dest);

    if (statDest.isFile()) {
      // Remove the root directory from the path
      var baseDest = path.relative(originalDest, dest);
      var fullPath = baseDest;
      if (options.base) {
        fullPath = path.join(options.base, baseDest);
      }

      var existsInSrc = utils.existsSync(path.join(src, fullPath));
      if (utils.isIgnored(options.ignoreInDest, baseDest) && existsInSrc) {
        fs.removeSync(dest);
        if (options.verbose) {
          utils.verbose(null, dest, 'removed');
        }
        stat.removed++;
      }
    } else if (statDest.isDirectory()) {
      var leaves = fs.readdirSync(dest);
      leaves.forEach(function(filepath) {
        remove(
          path.join(src, filepath),
          path.join(dest, filepath),
          options,
          stat,
          originalDest
        );
      });
    }
  }
};

/**
 * Copy and update files
 *
 * @param {Array|String} src
 * @param {String} dest
 * @param {Object} options
 * @param {Object} stat
 */
var sync = function(src, dest, options, stat) {
  var statSrc = fs.statSync(src);

  if (statSrc.isFile()) {
    if (utils.existsSync(dest)) {
      var statDest = fs.statSync(dest);
      if (statSrc.ctime.getTime() > statDest.ctime.getTime() && options.updateAndDelete) {
        fs.removeSync(dest);
        fs.copySync(src, dest);
        if (options.verbose) {
          utils.verbose(src, dest, 'updated');
        }
        stat.updated++;
      } else {
        stat.passed++;
      }
    } else {
      fs.copySync(src, dest);
      if (options.verbose) {
        utils.verbose(src, dest, 'created');
      }
      stat.created++;
    }
  } else if (statSrc.isDirectory()) {
    var leaves = fs.readdirSync(src);
    leaves.forEach(function(filepath) {
      sync(path.join(src, filepath), path.join(dest, filepath), options, stat);
    });
  }
};

module.exports.sync = sync;
module.exports.remove = remove;
