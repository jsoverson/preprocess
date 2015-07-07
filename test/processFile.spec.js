'use strict';

var chai = require('chai'),
  pp = require('../lib/preprocess'),
  fs = require('fs'),
  copyFile = require('./lib/copyFile');

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

  it('shall allow setting file extension explicitly', function (done) {
    copyFile(
      'test/fixtures/processFile/processFileTest.html',
      'test/tmp/processFileTest.js',
      function () {
        var expected = "a0xDEADBEEFb";

        pp.preprocessFile(
          'test/tmp/processFileTest.js',
          'test/tmp/processFileTest.dest.js',
          {TEST: '0xDEADBEEF'},
          function () {
            fs.readFileSync('test/tmp/processFileTest.dest.js').toString().should.equal(expected);

            done();
          },
          {type: 'html'}
        );
      });
  });

  it('shall allow setting srcDir explicitly', function (done) {
    copyFile(
      'test/fixtures/processFile/processFileTestInclude.html',
      'test/tmp/processFileTestInclude.html',
      function () {
        var expected = "a\r\na0xDEADBEEFb\r\nb";

        pp.preprocessFile(
          'test/tmp/processFileTestInclude.html',
          'test/tmp/processFileTestInclude.dest.html',
          {TEST: '0xDEADBEEF'},
          function () {
            fs.readFileSync('test/tmp/processFileTestInclude.dest.html').toString().should.equal(expected);

            done();
          },
          {
            srcDir: 'test/fixtures/processFile',
            srcEol: '\r\n'
          }
        );
      });
  });
});