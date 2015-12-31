'use strict';

const fs = require('fs-extra');
const dirSync = require('../');
const utils = require('../lib/utils');

it('[without glob] Default test', (done) => {
  dirSync(['test/fixtures/one', 'test/fixtures/two'], '.tmp/default').end();

  const files = {
    one: fs.statSync('.tmp/default/test/fixtures/one/test.txt').isFile(),
    nested: fs.statSync('.tmp/default/test/fixtures/one/nested/test.txt').isFile(),
    two: fs.statSync('.tmp/default/test/fixtures/two/test.txt').isFile()
  };

  if (files.one && files.nested && files.two) {
    done();
    return;
  }
});

it('[base] Default test with base options', (done) => {
  dirSync(['test/fixtures/one', 'test/fixtures/two'], '.tmp/default_base', {
    base: 'test/fixtures'
  }).end();

  const files = {
    one: fs.statSync('.tmp/default_base/one/test.txt').isFile(),
    nested: fs.statSync('.tmp/default_base/one/nested/test.txt').isFile(),
    two: fs.statSync('.tmp/default_base/two/test.txt').isFile()
  };

  if (files.one && files.nested && files.two) {
    done();
    return;
  }
});

it('[remove] Deleting files', (done) => {
  fs.ensureDirSync('.tmp/ignore_string/one/');
  fs.writeJsonSync('.tmp/ignore_string/one/ignore.json', { ignore: true });
  dirSync(['test/fixtures/one', 'test/fixtures/two'], '.tmp/remove').end();

  const files = {
    json: utils.existsSync('.tmp/remove/one/ignore.json')
  };

  if (!files.json) {
    done();
    return;
  }
});
