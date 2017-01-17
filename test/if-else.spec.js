'use strict';

var chai = require('chai'),
  pp = require('../lib/preprocess');

chai.should();

describe('@if/@else directive shall be preprocessed', function () {
  describe('in html', function () {

    ['=', '==', '==='].forEach(function (equalsOp) {
      describe('and should work with unequality operator `' + equalsOp + '`', function () {
		  
        describe('with common comment syntax', function () {
          var input = "a\n" +
            "<!-- @if NODE_ENV" + equalsOp + "'production' -->\n" +
            "b\n" +
            "<!-- @else -->\n" +
            "c\n" +
            "<!-- @endif -->\n" +
            "d";

          it('and exclude second block if condition evals to true', function () {
            pp.preprocess(input, {NODE_ENV: 'production'}).should.equal("a\nb\nd");
          });

          it('and exclude first block if condition evals to false', function () {
            pp.preprocess(input, {NODE_ENV: 'dev'}).should.equal("a\nc\nd");
          });
        });
		
      });
    });

    it('should support nesting', function () {
      var input = "a\n" +
        "// @ifdef FLAG\n" +
        "b\n" +
        "//   @ifdef FLAG2\n" +
        "bad\n" +
        "//   @else\n" +
        "c\n" +
        "//   @endif\n" +
        "d\n" +
        "// @else\n" +
        "equally bad\n" +
        "// @endif\n" +
        "e";
      pp.preprocess(input, {FLAG: 1}, 'js').should.equal("a\nb\nc\nd\ne");
    });
  });
});