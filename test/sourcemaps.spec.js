'use strict';

var chai = require('chai'),
  pp = require('../lib/preprocess');

chai.should();

describe('when the sourcemaps option is true it should maintain the line count', function () {

  describe('with @if directive', function () {
    var input = "a\n" +
      "// @if NODE_ENV=='production' \n" +
      "b\n" +
      "c\n" +
      "// @endif \n" +
      "d";

    it('when condition evals to true', function () {
      pp.preprocess(input, {NODE_ENV: 'production'}, {type: 'js', supportSourceMaps: true}).should.equal("a\n\nb\nc\n\nd");
    });

    it('when condition evals to false', function () {
      pp.preprocess(input, {NODE_ENV: 'dev'}, {type: 'js', supportSourceMaps: true}).should.equal("a\n\n\n\n\nd");
    });
  });

});
