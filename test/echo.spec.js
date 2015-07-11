'use strict';

var chai = require('chai'),
  pp = require('../lib/preprocess');

chai.should();

describe('@echo directive shall be preprocessed', function () {
  var input;

  describe('in html', function () {
    it('and resolve and echo variables', function () {
      input = "a<!-- @echo FINGERPRINT -->c";
      pp.preprocess(input, {FINGERPRINT: '0xDEADBEEF'}).should.equal("a0xDEADBEEFc");
    });

    it('and echo strings', function () {
      input = "a<!-- @echo '-FOO*' -->c";
      pp.preprocess(input).should.equal("a-FOO*c");
    });
  });

  describe('in javascript', function () {
    it('and resolve and echo variables (block)', function () {
      input = "a/* @echo FINGERPRINT */c";
      pp.preprocess(input, {FINGERPRINT: '0xDEADBEEF'}, 'js').should.equal("a0xDEADBEEFc");
    });

    it('and echo strings (block)', function () {
      input = "a/* @echo '-FOO*' */c";
      pp.preprocess(input, {}, 'js').should.equal("a-FOO*c");
    });

    it('and resolve and echo variables (line)', function () {
      input = "a\n// @echo FINGERPRINT\nc";
      pp.preprocess(input, {FINGERPRINT: '0xDEADBEEF'}, 'js').should.equal("a\n0xDEADBEEF\nc");
    });

    it('and echo strings (line)', function () {
      input = "a\n// @echo '-FOO*'\nc";
      pp.preprocess(input, {}, 'js').should.equal("a\n-FOO*\nc");
    });
  });

  describe('in plain text files', function () {
    it('and resolve and echo variables', function () {
      input = "a\n@echo FINGERPRINT\nc";
      pp.preprocess(input, {FINGERPRINT: '0xDEADBEEF'}, 'simple').should.equal("a\n0xDEADBEEF\nc");
    });

    it('and echo strings', function () {
      input = "a\n@echo '-FOO*'\nc";
      pp.preprocess(input, {}, 'simple').should.equal("a\n-FOO*\nc");
    });
  });

  describe('in coffeescript', function () {
    it('and resolve and echo variables', function () {
      input = "a\n# @echo FINGERPRINT\nc";
      pp.preprocess(input, {FINGERPRINT: '0xDEADBEEF'}, 'coffee').should.equal("a\n0xDEADBEEF\nc");
    });

    it('and resolve and echo variables (multiple hashes)', function () {
      input = "a\n## @echo FINGERPRINT\nc";
      pp.preprocess(input, {FINGERPRINT: '0xDEADBEEF'}, 'coffee').should.equal("a\n0xDEADBEEF\nc");
    });

    it('and echo strings', function () {
      input = "a\n# @echo '-FOO*'\nc";
      pp.preprocess(input, {}, 'coffee').should.equal("a\n-FOO*\nc");
    });
  });

  describe('with multiple @echo directives inline in html/js', function () {
    var input;

    it('without overreaching', function () {
      input = "a<!-- @echo FOO -->b<!-- @echo BAR -->c";
      pp.preprocess(input, {FOO: 1, BAR: 2}).should.equal("a1b2c");
    });

    it('without overreaching (js)', function () {
      input = "a/* @echo FOO */b/* @echo BAR */c";
      pp.preprocess(input, {FOO: 1, BAR: 2}, 'js').should.equal("a1b2c");
    });

    it('without overreaching when string param contains `-` and `*` chars ', function () {
      input = "a<!-- @echo '-*' -->b<!-- @echo '*-' -->c";
      pp.preprocess(input, {FOO: 1, BAR: 2}).should.equal("a-*b*-c");
    });

    it('without overreaching when string param contains `-` and `*` chars (js)', function () {
      input = "a/* @echo '-*' */b/* @echo '*-' */c";
      pp.preprocess(input, {FOO: 1, BAR: 2}, 'js').should.equal("a-*b*-c");
    });
  });

  describe('and shall allow omitting of whitespaces', function () {
    it('in html before and after the directive', function () {
      input = "a<!--@echo FINGERPRINT-->c";
      pp.preprocess(input, {FINGERPRINT: '0xDEADBEEF'}).should.equal("a0xDEADBEEFc");
    });

    describe('in javascript', function () {
      it('before and after the directive (block)', function () {
        input = "a/*@echo FINGERPRINT*/c";
        pp.preprocess(input, {FINGERPRINT: '0xDEADBEEF'}, 'js').should.equal("a0xDEADBEEFc");
      });

      it('before the directive (line)', function () {
        input = "a\n//@echo FINGERPRINT\nc";
        pp.preprocess(input, {FINGERPRINT: '0xDEADBEEF'}, 'js').should.equal("a\n0xDEADBEEF\nc");
      });
    });

    it('in coffeescript before the directive', function () {
      input = "a\n#@echo FINGERPRINT\nc";
      pp.preprocess(input, {FINGERPRINT: '0xDEADBEEF'}, 'coffee').should.equal("a\n0xDEADBEEF\nc");
    });
  });
});
