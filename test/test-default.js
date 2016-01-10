'use strict';

var path = require('path');
var fs = require('fs');
var assert = require('assert');
var dirSync = require('../');

// Recursively read a directory
var recurseReadDir = function(root, files, prefix) {
  prefix = prefix || '';
  files = files || [];

  var dir = path.join(root, prefix);
  if (!fs.existsSync(dir)) {
    return files;
  }
  if (fs.statSync(dir).isDirectory()) {
    fs.readdirSync(dir).forEach(function(name) {
      recurseReadDir(root, files, path.join(prefix, name));
    });
  } else {
    files.push(prefix);
  }

  return files;
};

// Creating test files
var createFiles = function(filepath, count) {
  require('mkdirp').sync(filepath);
  for (var i = 0; i < count; i++) {
    var testFile = path.join(filepath, 'test-' + i + '.txt');
    fs.writeFileSync(testFile, 'test');
  }
};

describe('Default tasks', function() {
  it('Copying', function(done) {
    dirSync(['test/fixtures/**/*'], '.tmp/glob')
      .on('end', function() {
        var result = recurseReadDir('.tmp/glob');
        assert.equal(result.length, 8);
        done();
      })
      .end();
  });

  it('Copying with base', function(done) {
    dirSync(['test/fixtures/**'], '.tmp/base', { base: 'test/fixtures' })
      .on('end', function() {
        var result = recurseReadDir('.tmp/base');
        assert.equal(result.length, 8);
        done();
      })
      .end();
  });

  it('Removing files', function(done) {
    createFiles('.tmp/remove/test/fixtures', 3);
    dirSync(['test/fixtures/**'], '.tmp/remove')
      .on('end', function() {
        var result = recurseReadDir('.tmp/remove');
        assert.equal(result.length, 8);
        done();
      })
      .end();
  });

  it('Skipping files', function(done) {
    dirSync(['test/fixtures/**'], '.tmp/skip')
      .on('end', function() {
        dirSync(['test/fixtures/**'], '.tmp/skip')
          .on('end', function() {
            var result = recurseReadDir('.tmp/skip');
            assert.equal(result.length, 8);
            done();
          })
          .end();
      })
      .end();
  });
});
