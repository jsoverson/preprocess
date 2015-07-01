'use strict';

var chai = require('chai'),
  spies = require("chai-spies"),
  pp = require('../lib/preprocess'),
  hello = require('./lib/hello');

chai.should();
chai.use(spies);

describe('@include directive shall be preprocessed', function () {
  var input, helloSpy;

  beforeEach(function(){
    helloSpy = chai.spy(hello);
  });

  describe('in html', function () {
    it('and include files', function () {
      input = "a<!-- @include include.html -->c";
      pp.preprocess(input, {
        srcDir: 'test/fixtures/include',
        hello: helloSpy
      }).should.equal("a!foobar!Hello html!!bazqux!c");
      helloSpy.should.have.been.called.with('html');
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
        hello: helloSpy
      }, 'js').should.equal("a\n !foobar!Hello js!\n !bazqux!c");
      helloSpy.should.have.been.called.with('js');
    });

    it('and include files and indent if ending with a newline (block)', function () {
      input = "a\n /* @include includenewline.txt */c";
      pp.preprocess(input, {srcDir: 'test/fixtures/include'}, 'js').should.equal("a\n !foobar!\n c");
    });

    it('and include files (line)', function () {
      input = "a\n// @include include.js\nc";
      pp.preprocess(input, {
        srcDir: 'test/fixtures/include',
        hello: helloSpy
      }, 'js').should.equal("a\n!foobar!\nHello js!\n!bazqux!\nc");
      helloSpy.should.have.been.called.with('js');
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
        hello: helloSpy
      }, 'simple').should.equal("a\n!foobar!\nHello simple!\n!bazqux!\nc");
      helloSpy.should.have.been.called.with('simple');
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
        hello: helloSpy
      }, 'coffee').should.equal("a\n!foobar!\nHello coffee!\n!bazqux!\nc");
      helloSpy.should.have.been.called.with('coffee');
    });

    it('and include files (multiple hashes)', function () {
      input = "a\n## @include include.coffee\nc";
      pp.preprocess(input, {
        srcDir: 'test/fixtures/include',
        hello: helloSpy
      }, 'coffee').should.equal("a\n!foobar!\nHello coffee!\n!bazqux!\nc");
      helloSpy.should.have.been.called.with('coffee');
    });

    it('and include files and indent if ending with a newline', function () {
      input = "a\n # @include includenewline.txt\nc";
      pp.preprocess(input, {srcDir: 'test/fixtures/include'}, 'coffee').should.equal("a\n !foobar!\n \nc");
    });
  });

  describe('and shall allow omitting of whitespaces', function () {
    it('in html before and after the directive', function () {
      input = "a<!--@include include.html-->c";
      pp.preprocess(input, {
        srcDir: 'test/fixtures/include',
        hello: helloSpy
      }).should.equal("a!foobar!Hello html!!bazqux!c");
      helloSpy.should.have.been.called.with('html');
    });

    describe('in javascript', function () {
      it('before and after the directive (block)', function () {
        input = "a\n /*@include include.block.js*/c";
        pp.preprocess(input, {
          srcDir: 'test/fixtures/include',
          hello: helloSpy
        }, 'js').should.equal("a\n !foobar!Hello js!\n !bazqux!c");
        helloSpy.should.have.been.called.with('js');
      });

      it('before the directive (line)', function () {
        input = "a\n//@include include.js\nc";
        pp.preprocess(input, {
          srcDir: 'test/fixtures/include',
          hello: helloSpy
        }, 'js').should.equal("a\n!foobar!\nHello js!\n!bazqux!\nc");
        helloSpy.should.have.been.called.with('js');
      });
    });

    it('in coffeescript before the directive', function () {
      input = "a\n#@include include.coffee\nc";
      pp.preprocess(input, {
        srcDir: 'test/fixtures/include',
        hello: helloSpy
      }, 'coffee').should.equal("a\n!foobar!\nHello coffee!\n!bazqux!\nc");
      helloSpy.should.have.been.called.with('coffee');
    });
  });
});