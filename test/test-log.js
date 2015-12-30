'use strict';

const gutil = require('gulp-util');
const dirSync = require('../');

let stdout = '';
const stdoutHook = () => {
  stdout = '';
  gutil.log = function() {
    stdout += JSON.stringify(arguments);
  };
};

it('[printSummary:boolean] Displays summary information about changes', (done) => {
  stdoutHook();
  dirSync(['test/fixtures/**/*', '!test/fixtures/two/**'], '.tmp/log_print_boolean', {
    base: 'test/fixtures',
    printSummary: true
  }).end();

  if (/\\u001b\[32m3\\u001b\[39m files created/.test(stdout)) {
    done();
    return;
  }

  done(new Error(stdout));
});

it('[printSummary:function] Displays summary information about changes', (done) => {
  stdoutHook();
  dirSync(['test/fixtures/**/*', '!test/fixtures/two/**'], '.tmp/log_print_function', {
    base: 'test/fixtures',
    printSummary: (stat) => gutil.log('test:' + stat.created)
  }).end();

  if (/test:3/.test(stdout)) {
    done();
    return;
  }

  done(new Error(stdout));
});

it('[verbose] Displays information about all changes', (done) => {
  stdoutHook();
  dirSync(['test/fixtures/**/*', '!test/fixtures/two/**'], '.tmp/log_verbose', {
    base: 'test/fixtures',
    verbose: true
  }).end();

  if (/Copying \\u001b\[36mtest\/fixtures\/one\/test.txt\\u001b\[39m/.test(stdout)) {
    done();
    return;
  }

  done(new Error(stdout));
});
