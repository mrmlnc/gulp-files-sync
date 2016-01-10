var path = require('path');
var fs = require('fs');

/**
 * Test whether or not the given path exists by checking with the file system
 *
 * @param {String} filepath
 */
module.exports.existsStatSync = function(filepath) {
  try {
    return fs.statSync(filepath);
  } catch (err) {
    return false;
  }
};

/**
 * Processing path to the source directory from destination directory
 *
 * @param {String} srcPath
 * @param {String} dest
 * @param {Object} opts
 */
module.exports.fromDestToSrcPath = function(dest, destOrig, opts) {
  dest = path.relative(destOrig, dest);
  if (opts.base) {
    dest = path.join(opts.base, dest);
  }

  return dest.replace(/\\/g, '/');
};

/**
 * Processing path to the destination directory from source directory
 *
 * @param {String} srcPath
 * @param {String} dest
 * @param {Object} opts
 */
module.exports.fromSrcToDestPath = function(src, dest, opts) {
  if (opts.base) {
    src = path.relative(opts.base, src);
  }

  return path.join(dest, src);
};

/**
 * Expanding of the directories in path
 *
 * @param {String} filepath
 */
module.exports.getPathsTree = function(filepath) {
  filepath = filepath.split('/');
  var arr = [filepath[0]];
  filepath.reduce(function(sum, current) {
    var next = path.join(sum, current).replace(/\\/g, '/');
    arr.push(next);
    return next;
  });

  return arr;
};