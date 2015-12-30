'use strict';

const fs = require('fs-extra');
const dirSync = require('../');

it('[ignoreInDest:string] Ignoring files in the destination directory', (done) => {
  fs.ensureDirSync('.tmp/ignore_string/one/');
  fs.writeJsonSync('.tmp/ignore_string/one/ignore.json', { ignore: true });

  dirSync(['test/fixtures/**/*', '!test/fixtures/two/**'], '.tmp/ignore_string', {
    base: 'test/fixtures',
    ignoreInDest: 'one/ignore.json'
  }).end();

  const files = {
    json: fs.statSync('.tmp/ignore_string/one/ignore.json')
  };

  if (files.json) {
    done();
    return;
  }
});

it('[ignoreInDest:glob] Ignoring files in the destination directory', (done) => {
  fs.ensureDirSync('.tmp/ignore_glob/one/');
  fs.writeJsonSync('.tmp/ignore_glob/one/ignore.json', { ignore: true });
  fs.writeJsonSync('.tmp/ignore_glob/one/ignore.txt', { ignore: true });

  dirSync(['test/fixtures/**/*', '!test/fixtures/two/**'], '.tmp/ignore_glob', {
    base: 'test/fixtures',
    ignoreInDest: ['one/*.json', 'one/ignore.txt']
  }).end();

  const files = {
    json: fs.statSync('.tmp/ignore_glob/one/ignore.json'),
    txt: fs.statSync('.tmp/ignore_glob/one/ignore.txt')
  };

  if (files.json && files.txt) {
    done();
    return;
  }
});
