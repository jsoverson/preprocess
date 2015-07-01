'use strict';

var chai = require('chai'),
  spies = require("chai-spies"),
  pp = require('../lib/preprocess'),
  hello = require('./lib/hello');

chai.should();
chai.use(spies);

describe('@exec directive shall be preprocessed', function () {
  var input, helloSpy;

  beforeEach(function(){
    helloSpy = chai.spy(hello);
  });

  describe('in html', function () {
    it('and execute function with one parameter', function () {
      input = "a<!-- @exec hello('Chuck Norris') -->c";
      pp.preprocess(input, {hello: helloSpy}).should.equal("aHello Chuck Norris!c");
      helloSpy.should.have.been.called.with('Chuck Norris');
    });

    it('and execute function with two parameters', function () {
      input = "a<!-- @exec hello(\"Chuck Norris\", 'Gandhi') -->c";
      pp.preprocess(input, {hello: helloSpy}).should.equal("aHello Chuck Norris,Gandhi!c");
      helloSpy.should.have.been.called.with('Chuck Norris', 'Gandhi');
    });

    it('and execute function with two parameters: one string and one variable', function () {
      input = "a<!-- @exec hello(\"Chuck Norris\", buddy) -->c";
      pp.preprocess(input, {
        hello: helloSpy,
        buddy: 'Michael Jackson'
      }).should.equal("aHello Chuck Norris,Michael Jackson!c");
      helloSpy.should.have.been.called.with('Chuck Norris', 'Michael Jackson');
    });
  });

  describe('in javascript', function () {
    it('and execute function with one parameter (block)', function () {
      input = "a/* @exec hello('Chuck Norris') */c";
      pp.preprocess(input, {hello: helloSpy}, 'js').should.equal("aHello Chuck Norris!c");
      helloSpy.should.have.been.called.with('Chuck Norris');
    });

    it('and execute function with two parameters (block)', function () {
      input = "a/* @exec hello(\"Chuck Norris\", 'Gandhi') */c";
      pp.preprocess(input, {hello: helloSpy}, 'js').should.equal("aHello Chuck Norris,Gandhi!c");
      helloSpy.should.have.been.called.with('Chuck Norris', 'Gandhi');
    });

    it('and execute function with two parameters: one string and one variable (block)', function () {
      input = "a/* @exec hello(\"Chuck Norris\", buddy) */c";
      pp.preprocess(input, {
        hello: helloSpy,
        buddy: 'Michael Jackson'
      }, 'js').should.equal("aHello Chuck Norris,Michael Jackson!c");
      helloSpy.should.have.been.called.with('Chuck Norris', 'Michael Jackson');
    });

    it('and execute function with one parameter (line)', function () {
      input = "a\n// @exec hello('Chuck Norris')\nc";
      pp.preprocess(input, {hello: helloSpy}, 'js').should.equal("a\nHello Chuck Norris!\nc");
      helloSpy.should.have.been.called.with('Chuck Norris');
    });

    it('and execute function with two parameters (line)', function () {
      input = "a\n// @exec hello(\"Chuck Norris\", 'Gandhi')\nc";
      pp.preprocess(input, {hello: helloSpy}, 'js').should.equal("a\nHello Chuck Norris,Gandhi!\nc");
      helloSpy.should.have.been.called.with('Chuck Norris', 'Gandhi');
    });

    it('and execute function with two parameters: one string and one variable (line)', function () {
      input = "a\n// @exec hello(\"Chuck Norris\", buddy)\nc";
      pp.preprocess(input, {
        hello: helloSpy,
        buddy: 'Michael Jackson'
      }, 'js').should.equal("a\nHello Chuck Norris,Michael Jackson!\nc");
      helloSpy.should.have.been.called.with('Chuck Norris', 'Michael Jackson');
    });
  });

  describe('in plain text files', function () {
    it('and execute function with one parameter', function () {
      input = "a\n@exec hello('Chuck Norris')\nc";
      pp.preprocess(input, {hello: helloSpy}, 'simple').should.equal("a\nHello Chuck Norris!\nc");
      helloSpy.should.have.been.called.with('Chuck Norris');
    });

    it('and execute function with two parameters', function () {
      input = "a\n@exec hello(\"Chuck Norris\", 'Gandhi')\nc";
      pp.preprocess(input, {hello: helloSpy}, 'simple').should.equal("a\nHello Chuck Norris,Gandhi!\nc");
      helloSpy.should.have.been.called.with('Chuck Norris', 'Gandhi');
    });

    it('and execute function with two parameters: one string and one variable', function () {
      input = "a\n@exec hello(\"Chuck Norris\", buddy)\nc";
      pp.preprocess(input, {
        hello: helloSpy,
        buddy: 'Michael Jackson'
      }, 'simple').should.equal("a\nHello Chuck Norris,Michael Jackson!\nc");
      helloSpy.should.have.been.called.with('Chuck Norris', 'Michael Jackson');
    });
  });

  describe('in coffeescript', function () {
    it('and execute function with one parameter', function () {
      input = "a\n# @exec hello('Chuck Norris')\nc";
      pp.preprocess(input, {hello: helloSpy}, 'coffee').should.equal("a\nHello Chuck Norris!\nc");
      helloSpy.should.have.been.called.with('Chuck Norris');
    });

    it('and execute function with two parameters', function () {
      input = "a\n# @exec hello(\"Chuck Norris\", 'Gandhi')\nc";
      pp.preprocess(input, {hello: helloSpy}, 'coffee').should.equal("a\nHello Chuck Norris,Gandhi!\nc");
      helloSpy.should.have.been.called.with('Chuck Norris', 'Gandhi');
    });

    it('and execute function with two parameters (multiple hashes)', function () {
      input = "a\n## @exec hello(\"Chuck Norris\", 'Gandhi')\nc";
      pp.preprocess(input, {hello: helloSpy}, 'coffee').should.equal("a\nHello Chuck Norris,Gandhi!\nc");
      helloSpy.should.have.been.called.with('Chuck Norris', 'Gandhi');
    });

    it('and execute function with two parameters: one string and one variable', function () {
      input = "a\n# @exec hello(\"Chuck Norris\", buddy)\nc";
      pp.preprocess(input, {
        hello: helloSpy,
        buddy: 'Michael Jackson'
      }, 'coffee').should.equal("a\nHello Chuck Norris,Michael Jackson!\nc");
      helloSpy.should.have.been.called.with('Chuck Norris', 'Michael Jackson');
    });
  });

  describe('and shall allow omitting of whitespaces', function () {
    it('in html before and after the directive', function () {
      input = "a<!-- @exec hello('Chuck Norris') -->c";
      pp.preprocess(input, {hello: helloSpy}).should.equal("aHello Chuck Norris!c");
      helloSpy.should.have.been.called.with('Chuck Norris');
    });

    describe('in javascript', function () {
      it('before and after the directive (block)', function () {
        input = "a/*@exec hello('Chuck Norris')*/c";
        pp.preprocess(input, {hello: helloSpy}, 'js').should.equal("aHello Chuck Norris!c");
        helloSpy.should.have.been.called.with('Chuck Norris');
      });

      it('before the directive (line)', function () {
        input = "a\n//@exec hello('Chuck Norris')\nc";
        pp.preprocess(input, {hello: helloSpy}, 'js').should.equal("a\nHello Chuck Norris!\nc");
        helloSpy.should.have.been.called.with('Chuck Norris');
      });
    });

    it('in coffeescript before the directive', function () {
      input = "a\n#@exec hello('Chuck Norris')\nc";
      pp.preprocess(input, {hello: helloSpy}, 'coffee').should.equal("a\nHello Chuck Norris!\nc");
      helloSpy.should.have.been.called.with('Chuck Norris');
    });
  });
});