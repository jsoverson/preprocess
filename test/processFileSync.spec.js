'use strict';

var chai = require('chai'),
  pp = require('../lib/preprocess'),
  fs = require('fs');

chai.should();

describe('processFileSync', function () {
  beforeEach(function () {
    if (!fs.existsSync('test/tmp')) {
      fs.mkdirSync('test/tmp');
    }
  });

  it('shall preprocess files synchronously', function () {
    var expected = "a0xDEADBEEFb";

    pp.preprocessFileSync(
      'test/fixtures/processFile/processFileTest.html',
      'test/tmp/processFileTest.dest.html',
      {TEST: '0xDEADBEEF'}
    );
    fs.readFileSync('test/tmp/processFileTest.dest.html').toString().should.equal(expected);
  });
});