'use strict';

var chai = require('chai'),
  pp = require('../lib/preprocess'),
  fs = require('fs'),
  copyFile = require('./lib/copyFile');

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

  it('shall allow setting file extension explicitly', function (done) {
    copyFile(
      'test/fixtures/processFile/processFileTest.html',
      'test/tmp/processFileTest.js',
      function () {
        var expected = "a0xDEADBEEFb";

        pp.preprocessFileSync(
          'test/tmp/processFileTest.js',
          'test/tmp/processFileTest.dest.js',
          {TEST: '0xDEADBEEF'},
          {type: 'html'}
        );

        fs.readFileSync('test/tmp/processFileTest.dest.js').toString().should.equal(expected);

        done();
      });
  });

  it('shall allow setting srcDir explicitly', function (done) {
    copyFile(
      'test/fixtures/processFile/processFileTestInclude.html',
      'test/tmp/processFileTestInclude.html',
      function () {
        var expected = "a\r\na0xDEADBEEFb\r\nb";

        pp.preprocessFileSync(
          'test/tmp/processFileTestInclude.html',
          'test/tmp/processFileTestInclude.dest.html',
          {TEST: '0xDEADBEEF'},
          {
            srcDir: 'test/fixtures/processFile',
            srcEol: '\r\n'
          }
        );

        fs.readFileSync('test/tmp/processFileTestInclude.dest.html').toString().should.equal(expected);

        done();
      });
  });
});