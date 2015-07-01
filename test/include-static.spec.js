'use strict';

var chai = require('chai'),
  pp = require('../lib/preprocess');

chai.should();

describe('@include-static directive shall be preprocessed', function () {
  var input;

  describe('in html', function () {
    it('and include files non-recursively', function () {
      input = "a<!-- @include-static include.html -->c";
      pp.preprocess(input, {srcDir: 'test/fixtures/include'})
        .should.equal("a!foobar!<!-- @exec hello('html') --><!-- @include static.txt -->c");
    });

    it('and include files and indent if ending with a newline', function () {
      input = "a\n <!-- @include-static includenewline.txt -->c";
      pp.preprocess(input, {srcDir: 'test/fixtures/include'}).should.equal("a\n !foobar!\n c");
    });
  });

  describe('in javascript', function () {
    it('and include files non-recursively (block)', function () {
      input = "a\n /* @include-static include.block.js */c";
      pp.preprocess(input, {srcDir: 'test/fixtures/include'}, 'js')
        .should.equal("a\n !foobar!/* @exec hello('js') */\n /* @include static.txt */c");
    });

    it('and include files and indent if ending with a newline (block)', function () {
      input = "a\n /* @include-static includenewline.txt */c";
      pp.preprocess(input, {srcDir: 'test/fixtures/include'}, 'js').should.equal("a\n !foobar!\n c");
    });

    it('and include files non-recursively (line)', function () {
      input = "a\n// @include-static include.js\nc";
      pp.preprocess(input, {srcDir: 'test/fixtures/include'}, 'js')
        .should.equal("a\n!foobar!\n// @exec hello('js')\n// @include static.txt\nc");
    });

    it('and include files and indent if ending with a newline (line)', function () {
      input = "a\n // @include-static includenewline.txt\nc";
      pp.preprocess(input, {srcDir: 'test/fixtures/include'}, 'js').should.equal("a\n !foobar!\n \nc");
    });
  });

  describe('in plain text files', function () {
    it('and include files non-recursively', function () {
      input = "a\n@include-static include.txt\nc";
      pp.preprocess(input, {srcDir: 'test/fixtures/include'}, 'simple')
        .should.equal("a\n!foobar!\n@exec hello('simple')\n@include static.txt\nc");
    });

    it('and include files and indent if ending with a newline', function () {
      input = "a\n @include-static includenewline.txt\nc";
      pp.preprocess(input, {srcDir: 'test/fixtures/include'}, 'simple').should.equal("a\n !foobar!\n \nc");
    });
  });

  describe('in coffeescript', function () {
    it('and include files non-recursively', function () {
      input = "a\n# @include-static include.coffee\nc";
      pp.preprocess(input, {srcDir: 'test/fixtures/include'}, 'coffee')
        .should.equal("a\n!foobar!\n# @exec hello('coffee')\n# @include static.txt\nc");
    });

    it('and include files non-recursively (multiple hashes)', function () {
      input = "a\n## @include-static include.coffee\nc";
      pp.preprocess(input, {srcDir: 'test/fixtures/include'}, 'coffee')
        .should.equal("a\n!foobar!\n# @exec hello('coffee')\n# @include static.txt\nc");
    });

    it('and include files and indent if ending with a newline', function () {
      input = "a\n # @include-static includenewline.txt\nc";
      pp.preprocess(input, {srcDir: 'test/fixtures/include'}, 'coffee').should.equal("a\n !foobar!\n \nc");
    });
  });

  describe('and shall allow omitting of whitespaces', function () {
    it('in html before and after the directive', function () {
      input = "a<!--@include-static include.html-->c";
      pp.preprocess(input, {srcDir: 'test/fixtures/include'})
        .should.equal("a!foobar!<!-- @exec hello('html') --><!-- @include static.txt -->c");
    });

    describe('in javascript', function () {
      it('before and after the directive (block)', function () {
        input = "a\n /*@include-static include.block.js*/c";
        pp.preprocess(input, {srcDir: 'test/fixtures/include'}, 'js')
          .should.equal("a\n !foobar!/* @exec hello('js') */\n /* @include static.txt */c");
      });

      it('before the directive (line)', function () {
        input = "a\n//@include-static include.js\nc";
        pp.preprocess(input, {srcDir: 'test/fixtures/include'}, 'js')
          .should.equal("a\n!foobar!\n// @exec hello('js')\n// @include static.txt\nc");
      });
    });

    it('in coffeescript before the directive', function () {
      input = "a\n#@include-static include.coffee\nc";
      pp.preprocess(input, {srcDir: 'test/fixtures/include'}, 'coffee')
        .should.equal("a\n!foobar!\n# @exec hello('coffee')\n# @include static.txt\nc");
    });
  });
});