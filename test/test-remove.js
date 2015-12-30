'use strict';

const fs = require('fs-extra');
const dirSync = require('../');
const utils = require('../lib/utils');

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
