'use strict';

var chai = require('chai'),
  pp = require('../lib/preprocess');

chai.should();

describe('@ifndef directive shall be preprocessed', function () {
  var input;

  describe('in html', function () {
    it('success case, should be included', function () {
      input = "a<!-- @ifndef NONEXISTANT -->b<!-- @endif -->c";
      pp.preprocess(input, {}).should.equal("abc");
    });

    it('fail case, should not be included', function () {
      input = "a<!-- @ifndef NODE_ENV -->b<!-- @endif -->c";
      pp.preprocess(input, {NODE_ENV: 'dev'}).should.equal("ac");
    });

    it('success case, should be included (hidden by default syntax, end tag)', function () {
      input = "a<!-- @ifndef NONEXISTANT !>b<!-- @endif -->c";
      pp.preprocess(input, {}).should.equal("abc");
    });

    it('fail case, should not be included (hidden by default syntax, end tag)', function () {
      input = "a<!-- @ifndef NODE_ENV !>b<!-- @endif -->c";
      pp.preprocess(input, {NODE_ENV: 'dev'}).should.equal("ac");
    });

    it('success case, should be included (hidden by default syntax, end tag and start tag)', function () {
      input = "a<!-- @ifndef NONEXISTANT !>b<! @endif -->c";
      pp.preprocess(input, {}).should.equal("abc");
    });

    it('fail case, should not be included (hidden by default syntax, end tag and start tag)', function () {
      input = "a<!-- @ifndef NODE_ENV !>b<! @endif -->c";
      pp.preprocess(input, {NODE_ENV: 'dev'}).should.equal("ac");
    });

    it('should support nesting', function () {
      input = "a<!-- @ifndef NDEF -->b<!-- @ifndef NODE_ENV -->bad<!-- @endif -->c<!-- @endif -->d";
      pp.preprocess(input, {NODE_ENV: 'dev'}).should.equal("abcd");
    });
  });

  describe('in javascript', function () {
    it('success case, should be included (line)', function () {
      input = "a\n" +
        "// @ifndef NONEXISTANT\n" +
        "b\n" +
        "// @endif\n" +
        "c";
      pp.preprocess(input, {}, 'js').should.equal("a\nb\nc");
    });

    it('fail case, should not be included (line)', function () {
      input = "a\n" +
        "// @ifndef NODE_ENV\n" +
        "b\n" +
        "// @endif\n" +
        "c";
      pp.preprocess(input, {NODE_ENV: 'dev'}, 'js').should.equal("a\nc");
    });

    it('success case, should be included (block)', function () {
      input = "a/* @ifndef NONEXISTANT */b/* @endif */c";
      pp.preprocess(input, {}, 'js').should.equal("abc");
    });

    it('fail case, should not be included (block)', function () {
      input = "a/* @ifndef NODE_ENV */b/* @endif */c";
      pp.preprocess(input, {NODE_ENV: 'dev'}, 'js').should.equal("ac");
    });
  });

  describe('in coffeescript', function () {
    it('success case, should be included', function () {
      input = "a\n" +
        "# @ifndef FLAG\n" +
        "b\n" +
        "# @endif\n" +
        "c";
      pp.preprocess(input, {}, 'coffee').should.equal("a\nb\nc");
    });

    it('success case, should be included (multiple hashes)', function () {
      input = "a\n" +
        "## @ifndef FLAG\n" +
        "b\n" +
        "## @endif\n" +
        "c";
      pp.preprocess(input, {}, 'coffee').should.equal("a\nb\nc");
    });

    it('fail case, should not be included', function () {
      input = "a\n" +
        "# @ifndef FLAG\n" +
        "b\n" +
        "# @endif\n" +
        "c";
      pp.preprocess(input, {FLAG: 1}, 'coffee').should.equal("a\nc");
    });
  });
});