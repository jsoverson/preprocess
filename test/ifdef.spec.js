'use strict';

var chai = require('chai'),
  pp = require('../lib/preprocess');

chai.should();

describe('@ifdef directive shall be preprocessed', function () {
  var input;

  describe('in html', function () {
    it('fail case, should not be included', function () {
      input = "a<!-- @ifdef NONEXISTANT -->b<!-- @endif -->c";
      pp.preprocess(input, {}).should.equal("ac");
    });

    it('success case, should be included', function () {
      input = "a<!-- @ifdef NODE_ENV -->b<!-- @endif -->c";
      pp.preprocess(input, {NODE_ENV: 'dev'}).should.equal("abc");
    });

    it('fail case, should not be included (hidden by default syntax, end tag)', function () {
      input = "a<!-- @ifdef NONEXISTANT !>b<!-- @endif -->c";
      pp.preprocess(input, {}).should.equal("ac");
    });

    it('success case, should be included (hidden by default syntax, end tag)', function () {
      input = "a<!-- @ifdef NODE_ENV !>b<!-- @endif -->c";
      pp.preprocess(input, {NODE_ENV: 'dev'}).should.equal("abc");
    });

    it('fail case, should not be included (hidden by default syntax, end tag and start tag)', function () {
      input = "a<!-- @ifdef NONEXISTANT !>b<! @endif -->c";
      pp.preprocess(input, {}).should.equal("ac");
    });

    it('success case, should be included (hidden by default syntax, end tag and start tag)', function () {
      input = "a<!-- @ifdef NODE_ENV !>b<! @endif -->c";
      pp.preprocess(input, {NODE_ENV: 'dev'}).should.equal("abc");
    });
  });

  describe('in javascript', function () {
    it('fail case, should not be included (line)', function () {
      input = "a\n" +
        "// @ifdef NONEXISTANT\n" +
        "b\n" +
        "// @endif\n" +
        "c";
      pp.preprocess(input, {}, 'js').should.equal("a\nc");
    });

    it('success case, should be included (line)', function () {
      input = "a\n" +
        "// @ifdef NODE_ENV\n" +
        "b\n" +
        "// @endif\n" +
        "c";
      pp.preprocess(input, {NODE_ENV: 'dev'}, 'js').should.equal("a\nb\nc");
    });

    it('fail case, should not be included (block)', function () {
      input = "a/* @ifdef NONEXISTANT */b/* @endif */c";
      pp.preprocess(input, {}, 'js').should.equal("ac");
    });

    it('success case, should be included (block)', function () {
      input = "a/* @ifdef NODE_ENV */b/* @endif */c";
      pp.preprocess(input, {NODE_ENV: 'dev'}, 'js').should.equal("abc");
    });
  });

  describe('in coffeescript', function () {
    it('fail case, should not be included', function () {
      input = "a\n" +
        "# @ifdef FLAG\n" +
        "b\n" +
        "# @endif\n" +
        "c";
      pp.preprocess(input, {}, 'coffee').should.equal("a\nc");
    });

    it('success case, should be included', function () {
      input = "a\n" +
        "# @ifdef FLAG\n" +
        "b\n" +
        "# @endif\n" +
        "c";
      pp.preprocess(input, {FLAG: 1}, 'coffee').should.equal("a\nb\nc");
    });

    it('fail case, should not be included (multiple hashes)', function () {
      input = "a\n" +
        "## @ifdef FLAG\n" +
        "b\n" +
        "## @endif\n" +
        "c";
      pp.preprocess(input, {}, 'coffee').should.equal("a\nc");
    });

    it('should support nesting', function () {
      input = "a\n" +
        "# @ifdef FLAG\n" +
        "b\n" +
        "# @ifdef FLAG2\n" +
        "bad\n" +
        "# @endif\n" +
        "c\n" +
        "# @endif\n" +
        "d";
      pp.preprocess(input, {FLAG: 1}, 'coffee').should.equal("a\nb\nc\nd");
    });
  });
});