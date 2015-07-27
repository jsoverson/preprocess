'use strict';

var chai = require('chai'),
  pp = require('../lib/preprocess');

chai.should();

describe('@set directive shall be preprocessed', function () {
  var input;

  describe('in html', function () {
    it('set and echo variables', function () {
      input = "a<!-- @set test_variable_html \"12345\"-->\n<!-- @echo test_variable_html -->c";
      pp.preprocess(input).should.equal("a\n12345c");
    });
  });

  describe('in javascript', function () {
    it('set and echo variables', function () {
      input = "a/* @set test_variable_js \"12345\"*/\n/*@echo test_variable_js */c";
      pp.preprocess(input, {}, 'js').should.equal("a\n12345c");
    });
  });

  describe('in plain text files', function () {
    it('and resolve and echo variables', function () {
      input = "a\n@set test_variable_txt \"12345\"\n@echo test_variable_txt \nc";
      pp.preprocess(input, {}, 'simple').should.equal("a\n\n12345\nc");
    });
  });

  describe('in coffeescript', function () {
    it('and resolve and echo variables', function () {
      input = "a\n# @set test_variable_coffee \"12345\"\n# @echo test_variable_coffee\nc";
      pp.preprocess(input, {}, 'coffee').should.equal("a\n\n12345\nc");
    });
  });

});
