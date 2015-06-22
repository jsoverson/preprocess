'use strict';

var chai = require('chai'),
  pp = require('../lib/preprocess'),
  fs = require('fs');

chai.should();

describe('processFile', function () {
  beforeEach(function () {
    if (!fs.existsSync('test/tmp')) {
      fs.mkdirSync('test/tmp');
    }
  });

  it('shall preprocess files asynchronously', function (done) {
    var expected = "a0xDEADBEEFb";

    pp.preprocessFile(
      'test/fixtures/processFile/processFileTest.html',
      'test/tmp/processFileTest.dest.html',
      {TEST: '0xDEADBEEF'},
      function () {
        fs.readFileSync('test/tmp/processFileTest.dest.html').toString().should.equal(expected);

        done();
      }
    );
  });
});