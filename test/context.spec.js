'use strict';

var chai = require('chai'),
  pp = require('../lib/preprocess');

chai.should();

describe('preprocess context', function () {
  var input;

  it('default to env if not provided', function () {
    input = "a<!-- @echo FINGERPRINT -->c";
    process.env.FINGERPRINT = '0xDEADBEEF';

    pp.preprocess(input).should.equal("a0xDEADBEEFc");
  });

  describe('in nested cases', function () {
    var context = {'FOO': {'BAR': 'test'}};

    it('and resolve path-s and echo content to nested attrs', function () {
      input = "// @echo FOO.BAR";
      pp.preprocess(input, context, 'js').should.equal("test");
    });

    it('and maintain backwards compatibility', function () {
      input = "// @echo FOO";
      pp.preprocess(input, context, 'js').should.equal("[object Object]");
    });

    it('and be able to compare nested context attrs', function () {
      input = "a\n" +
        "// @if FOO.BAR=='test' \n" +
        "b\n" +
        "// @endif \n" +
        "c";
      pp.preprocess(input, context, 'js').should.equal("a\nb\nc");
    });
  });
});