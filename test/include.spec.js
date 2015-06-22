'use strict';

var chai = require('chai'),
  pp = require('../lib/preprocess');

chai.should();

describe('@include directive shall be preprocessed', function () {
  var input;

  function hello(expectedParamNumber) {
    (arguments.length - 1).should.equal(expectedParamNumber);

    var names = Array.prototype.slice.call(arguments, 1);

    return 'Hello ' + names.join() + '!';
  }

  describe('in html', function () {
    it('and include files', function () {
      input = "a<!-- @include include.html -->c";
      pp.preprocess(input, {
        srcDir: 'test/fixtures/include',
        hello: hello.bind(null, 1)
      }).should.equal("a!foobar!Hello html!!bazqux!c");
    });

    it('and include files and indent if ending with a newline', function () {
      input = "a\n <!-- @include includenewline.txt -->c";
      pp.preprocess(input, {srcDir: 'test/fixtures/include'}).should.equal("a\n !foobar!\n c");
    });
  });

  describe('in javascript', function () {
    it('and include files (block)', function () {
      input = "a\n /* @include include.block.js */c";
      pp.preprocess(input, {
        srcDir: 'test/fixtures/include',
        hello: hello.bind(null, 1)
      }, 'js').should.equal("a\n !foobar!Hello js!\n !bazqux!c");
    });

    it('and include files and indent if ending with a newline (block)', function () {
      input = "a\n /* @include includenewline.txt */c";
      pp.preprocess(input, {srcDir: 'test/fixtures/include'}, 'js').should.equal("a\n !foobar!\n c");
    });

    it('and include files (line)', function () {
      input = "a\n// @include include.js\nc";
      pp.preprocess(input, {
        srcDir: 'test/fixtures/include',
        hello: hello.bind(null, 1)
      }, 'js').should.equal("a\n!foobar!\nHello js!\n!bazqux!\nc");
    });

    it('and include files and indent if ending with a newline (line)', function () {
      input = "a\n // @include includenewline.txt\nc";
      pp.preprocess(input, {srcDir: 'test/fixtures/include'}, 'js').should.equal("a\n !foobar!\n \nc");
    });
  });

  describe('in plain text files', function () {
    it('and include files', function () {
      input = "a\n@include include.txt\nc";
      pp.preprocess(input, {
        srcDir: 'test/fixtures/include',
        hello: hello.bind(null, 1)
      }, 'simple').should.equal("a\n!foobar!\nHello simple!\n!bazqux!\nc");
    });

    it('and include files and indent if ending with a newline', function () {
      input = "a\n @include includenewline.txt\nc";
      pp.preprocess(input, {srcDir: 'test/fixtures/include'}, 'simple').should.equal("a\n !foobar!\n \nc");
    });
  });

  describe('in coffeescript', function () {
    it('and include files', function () {
      input = "a\n# @include include.coffee\nc";
      pp.preprocess(input, {
        srcDir: 'test/fixtures/include',
        hello: hello.bind(null, 1)
      }, 'coffee').should.equal("a\n!foobar!\nHello coffee!\n!bazqux!\nc");
    });

    it('and include files (multiple hashes)', function () {
      input = "a\n## @include include.coffee\nc";
      pp.preprocess(input, {
        srcDir: 'test/fixtures/include',
        hello: hello.bind(null, 1)
      }, 'coffee').should.equal("a\n!foobar!\nHello coffee!\n!bazqux!\nc");
    });

    it('and include files and indent if ending with a newline', function () {
      input = "a\n # @include includenewline.txt\nc";
      pp.preprocess(input, {srcDir: 'test/fixtures/include'}, 'coffee').should.equal("a\n !foobar!\n \nc");
    });
  });
});