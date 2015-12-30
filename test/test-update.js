'use strict';

const fs = require('fs');
const gutil = require('gulp-util');
const dirSync = require('../');

let stdout = '';
const stdoutHook = () => {
  stdout = '';
  gutil.log = function() {
    stdout += JSON.stringify(arguments);
  };
};

it('[update] Update files', (done) => {
  stdoutHook();
  dirSync(['test/fixtures/**/*', '!test/fixtures/two/**'], '.tmp/update', {
    base: 'test/fixtures'
  }).end();

  fs.writeFile('test/fixtures/root.txt', 'test', (err) => {
    if (err) {
      fs.writeFileSync('test/fixtures/root.txt', '');
      done(err);
    }

    dirSync(['test/fixtures/**/*', '!test/fixtures/two/**'], '.tmp/update', {
      base: 'test/fixtures',
      printSummary: (stat) => gutil.log('test:' + stat.updated)
    }).end();

    if (/test:1/.test(stdout)) {
      fs.writeFileSync('test/fixtures/root.txt', '');
      done();
      return;
    }

    fs.writeFileSync('test/fixtures/root.txt', '');
    done(new Error(stdout));
  });
});
