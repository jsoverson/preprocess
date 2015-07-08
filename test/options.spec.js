'use strict';

var chai = require('chai'),
  pp = require('../lib/preprocess');

chai.should();

describe('shall support multiple call signatures', function () {
  var input;

  describe('and support legacy mode', function () {
    it('with only the source param in which case context shall be extracted from process.env', function () {
      process.env.TEST = 'a';
      input = "a<!-- @ifdef TEST -->b<!-- @endif -->c";
      pp.preprocess(input).should.equal("abc");
    });

    it('with the source and context params and take srcDir property from context if available', function () {
      input = "a<!--@include static.txt-->c";
      pp.preprocess(input, {srcDir: 'test/fixtures/include'}).should.equal("a!bazqux!c");
    });

    it('with the source, context and type params', function () {
      input = "a/*@include static.txt*/c";
      pp.preprocess(input, {srcDir: 'test/fixtures/include'}, 'js').should.equal("a!bazqux!c");
    });
  });

  it('shall use process.cwd() if srcDir is not specified', function () {
    input = "a<!--@include test/fixtures/include/static.txt-->c";
    pp.preprocess(input).should.equal("a!bazqux!c");
  });

  describe('and support options object instead of type', function () {
    it('and use srcDir option', function () {
      input = "a<!--@include static.txt-->c";
      pp.preprocess(input, {}, {srcDir: "test/fixtures/include"}).should.equal("a!bazqux!c");
    });

    describe('and use fileNotFoundSilentFail option', function () {
      it('that should default to throwing an error when a file could not be found', function () {
        input = "a<!--@include static.txt-->c";
        (function () {
          pp.preprocess(input);
        }).should.throw(Error, /static.txt not found!/);

        input = "a<!--@extend static.txt-->b<!--@endextend-->c";
        (function () {
          pp.preprocess(input);
        }).should.throw(Error, /static.txt not found!/);
      });

      it('that should fall back to old behavior if it is set to true', function () {
        input = "a<!--@include static.txt-->c";
        pp.preprocess(input, {}, {fileNotFoundSilentFail: true}).should.match(/^a.*static.txt not found!c$/);

        input = "a<!--@extend static.txt-->b<!--@endextend-->c";
        pp.preprocess(input, {}, {fileNotFoundSilentFail: true}).should.match(/^a.*static.txt not found!c$/);
      });
    });

    it('and override automatic EOL detection with srcEol option', function () {
      input = "a\n<!--@include static.txt-->\nc";
      pp.preprocess(input, {}, {srcEol: '\r\n', srcDir: 'test/fixtures/include'}).should.equal("a\r\n!bazqux!\r\nc");
    });
  });
});