'use strict';

var chai = require('chai'),
  pp = require('../lib/preprocess');

chai.should();

describe('@exec directive shall be preprocessed', function () {
  var input;

  function hello(expectedParamNumber) {
    (arguments.length - 1).should.equal(expectedParamNumber);

    var names = Array.prototype.slice.call(arguments, 1);

    return 'Hello ' + names.join() + '!';
  }

  describe('in html', function () {
    it('and execute function with one parameter', function () {
      input = "a<!-- @exec hello('Chuck Norris') -->c";
      pp.preprocess(input, {hello: hello.bind(null, 1)}).should.equal("aHello Chuck Norris!c");
    });

    it('and execute function with two parameters', function () {
      input = "a<!-- @exec hello(\"Chuck Norris\", 'Gandhi') -->c";
      pp.preprocess(input, {hello: hello.bind(null, 2)}).should.equal("aHello Chuck Norris,Gandhi!c");
    });

    it('and execute function with two parameters: one string and one variable', function () {
      input = "a<!-- @exec hello(\"Chuck Norris\", buddy) -->c";
      pp.preprocess(input, {
        hello: hello.bind(null, 2),
        buddy: 'Michael Jackson'
      }).should.equal("aHello Chuck Norris,Michael Jackson!c");
    });
  });

  describe('in javascript', function () {
    it('and execute function with one parameter (block)', function () {
      input = "a/* @exec hello('Chuck Norris') */c";
      pp.preprocess(input, {hello: hello.bind(null, 1)}, 'js').should.equal("aHello Chuck Norris!c");
    });

    it('and execute function with two parameters (block)', function () {
      input = "a/* @exec hello(\"Chuck Norris\", 'Gandhi') */c";
      pp.preprocess(input, {hello: hello.bind(null, 2)}, 'js').should.equal("aHello Chuck Norris,Gandhi!c");
    });

    it('and execute function with two parameters: one string and one variable (block)', function () {
      input = "a/* @exec hello(\"Chuck Norris\", buddy) */c";
      pp.preprocess(input, {
        hello: hello.bind(null, 2),
        buddy: 'Michael Jackson'
      }, 'js').should.equal("aHello Chuck Norris,Michael Jackson!c");
    });

    it('and execute function with one parameter (line)', function () {
      input = "a\n// @exec hello('Chuck Norris')\nc";
      pp.preprocess(input, {hello: hello.bind(null, 1)}, 'js').should.equal("a\nHello Chuck Norris!\nc");
    });

    it('and execute function with two parameters (line)', function () {
      input = "a\n// @exec hello(\"Chuck Norris\", 'Gandhi')\nc";
      pp.preprocess(input, {hello: hello.bind(null, 2)}, 'js').should.equal("a\nHello Chuck Norris,Gandhi!\nc");
    });

    it('and execute function with two parameters: one string and one variable (line)', function () {
      input = "a\n// @exec hello(\"Chuck Norris\", buddy)\nc";
      pp.preprocess(input, {
        hello: hello.bind(null, 2),
        buddy: 'Michael Jackson'
      }, 'js').should.equal("a\nHello Chuck Norris,Michael Jackson!\nc");
    });
  });

  describe('in plain text files', function () {
    it('and execute function with one parameter', function () {
      input = "a\n@exec hello('Chuck Norris')\nc";
      pp.preprocess(input, {hello: hello.bind(null, 1)}, 'simple').should.equal("a\nHello Chuck Norris!\nc");
    });

    it('and execute function with two parameters', function () {
      input = "a\n@exec hello(\"Chuck Norris\", 'Gandhi')\nc";
      pp.preprocess(input, {hello: hello.bind(null, 2)}, 'simple').should.equal("a\nHello Chuck Norris,Gandhi!\nc");
    });

    it('and execute function with two parameters: one string and one variable', function () {
      input = "a\n@exec hello(\"Chuck Norris\", buddy)\nc";
      pp.preprocess(input, {
        hello: hello.bind(null, 2),
        buddy: 'Michael Jackson'
      }, 'simple').should.equal("a\nHello Chuck Norris,Michael Jackson!\nc");
    });
  });

  describe('in coffeescript', function () {
    it('and execute function with one parameter', function () {
      input = "a\n# @exec hello('Chuck Norris')\nc";
      pp.preprocess(input, {hello: hello.bind(null, 1)}, 'coffee').should.equal("a\nHello Chuck Norris!\nc");
    });

    it('and execute function with two parameters', function () {
      input = "a\n# @exec hello(\"Chuck Norris\", 'Gandhi')\nc";
      pp.preprocess(input, {hello: hello.bind(null, 2)}, 'coffee').should.equal("a\nHello Chuck Norris,Gandhi!\nc");
    });

    it('and execute function with two parameters (multiple hashes)', function () {
      input = "a\n## @exec hello(\"Chuck Norris\", 'Gandhi')\nc";
      pp.preprocess(input, {hello: hello.bind(null, 2)}, 'coffee').should.equal("a\nHello Chuck Norris,Gandhi!\nc");
    });

    it('and execute function with two parameters: one string and one variable', function () {
      input = "a\n# @exec hello(\"Chuck Norris\", buddy)\nc";
      pp.preprocess(input, {
        hello: hello.bind(null, 2),
        buddy: 'Michael Jackson'
      }, 'coffee').should.equal("a\nHello Chuck Norris,Michael Jackson!\nc");
    });
  });
});