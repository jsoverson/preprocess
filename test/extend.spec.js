'use strict';

var chai = require('chai'),
  pp = require('../lib/preprocess');

chai.should();

describe('@extend directive shall be preprocessed', function () {
  var input;

  describe('in html', function () {
    it('and extend files', function () {
      input = "<!-- @extend extend.html -->qr<!-- @endextend -->";
      pp.preprocess(input, {srcDir: 'test/fixtures/extend'}).should.equal("aqrb");
    });

    it('and support nested @extend', function () {
      input = "<!-- @extend extend.html -->q<!-- @extend extend.html -->x<!-- @endextend -->r<!-- @endextend -->";
      pp.preprocess(input, {srcDir: 'test/fixtures/extend'}).should.equal("aqaxbrb");
    });

    it('and extend files with multiple @extend-s in one line', function () {
      input = "x<!-- @extend extend.html -->qr<!-- @endextend -->y<!-- @extend extend.html -->hi<!-- @endextend -->z";
      pp.preprocess(input, {srcDir: 'test/fixtures/extend'}).should.equal("xaqrbyahibz");
    });

    it('and should strip newlines from inserted content', function () {
      input = "<!-- @extend extend.html -->\nqa\n<!-- @endextend -->";
      pp.preprocess(input, {srcDir: 'test/fixtures/extend'}).should.equal("aqab");
    });
  });

  describe('in javascript', function () {
    it('and extend files (block)', function () {
      input = "/* @extend extend.js */qr/* @endextend */";
      pp.preprocess(input, {srcDir: 'test/fixtures/extend'}, 'js').should.equal("aqrb");
    });

    it('and extend files with multiple @extend-s in one line (block)', function () {
      input = "x/* @extend extend.js */qr/* @endextend */y/* @extend extend.js */hi/* @endextend */z";
      pp.preprocess(input, {srcDir: 'test/fixtures/extend'}, 'js').should.equal("xaqrbyahibz");
    });

    it('and should strip newlines from inserted content (block)', function () {
      input = "/* @extend extend.js */\nqa\n/* @endextend */";
      pp.preprocess(input, {srcDir: 'test/fixtures/extend'}, 'js').should.equal("aqab");
    });

    it('and should strip newlines from inserted content (line)', function () {
      input = "// @extend extend.js\nqr\n// @endextend";
      pp.preprocess(input, {srcDir: 'test/fixtures/extend'}, 'js').should.equal("aqrb");
    });
  });

  describe('in coffeescript', function () {
    it('and extend files', function () {
      input = "# @extend extend.coffee\nqr\n# @endextend";
      pp.preprocess(input, {srcDir: 'test/fixtures/extend'}, 'coffee').should.equal("a\nqr\nb");
    });

    it('and should strip newlines from inserted content', function () {
      input = "# @extend extend.coffee\nqr\n# @endextend";
      pp.preprocess(input, {srcDir: 'test/fixtures/extend'}, 'coffee').should.equal("a\nqr\nb");
    });

    it('and should strip newlines from inserted content (multiple hashes)', function () {
      input = "## @extend extend.coffee\nqr\n## @endextend";
      pp.preprocess(input, {srcDir: 'test/fixtures/extend'}, 'coffee').should.equal("a\nqr\nb");
    });
  });

  describe('and shall allow omitting of whitespaces', function () {
    it('in html before and after the directive', function () {
      input = "<!--@extend extend.html-->qr<!--@endextend-->";
      pp.preprocess(input, {srcDir: 'test/fixtures/extend'}).should.equal("aqrb");
    });

    describe('in javascript', function () {
      it('before and after the directive (block)', function () {
        input = "/*@extend extend.js*/qr/*@endextend*/";
        pp.preprocess(input, {srcDir: 'test/fixtures/extend'}, 'js').should.equal("aqrb");
      });

      it('before the directive (line)', function () {
        input = "//@extend extend.js\nqr\n//@endextend";
        pp.preprocess(input, {srcDir: 'test/fixtures/extend'}, 'js').should.equal("aqrb");
      });
    });

    it('in coffeescript before the directive', function () {
      input = "#@extend extend.coffee\nqr\n#@endextend";
      pp.preprocess(input, {srcDir: 'test/fixtures/extend'}, 'coffee').should.equal("a\nqr\nb");
    });
  });
});