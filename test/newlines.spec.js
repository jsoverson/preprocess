'use strict';

var chai = require('chai'),
  spies = require("chai-spies"),
  pp = require('../lib/preprocess'),
  hello = require('./lib/hello');

chai.should();
chai.use(spies);

describe('newlines shall be handled in all common formats', function () {
  var input;

  it('and handle \\n (Unix) style EOLs', function () {
    input = "a\n" +
      "<!-- @ifdef TEST -->\n" +
      "b\n" +
      "<!-- @endif -->\n" +
      "c";
    pp.preprocess(input, {TEST: ""}).should.equal("a\nb\nc");
  });

  it('and handle \\r\\n (Windows) style EOLs', function () {
    input = "a\r\n" +
      "<!-- @ifdef TEST -->\r\n" +
      "b\r\n" +
      "<!-- @endif -->\r\n" +
      "c";
    pp.preprocess(input, {TEST: ""}).should.equal("a\r\nb\r\nc");
  });

  it('and handle \\r (legacy Mac) style EOLs', function () {
    input = "a\r" +
      "<!-- @ifdef TEST -->\r" +
      "b\r" +
      "<!-- @endif -->\r" +
      "c";
    pp.preprocess(input, {TEST: ""}).should.equal("a\rb\rc");
  });

  it('and replace EOL in sources with mixed style EOLs with the EOL from current OS', function () {
    var osEol = require('os').EOL;

    input = "a\r" +
      "<!-- @ifdef TEST -->\r\n" +
      "b\n" +
      "<!-- @endif -->\r" +
      "c";
    pp.preprocess(input, {TEST: ""}).should.equal("a" + osEol + "b" + osEol + "c");
  });

  it('and convert EOLs from included files into EOLs from target file when using @include', function () {
    // includenewline.txt has \n style EOLs
    input = "a\r" +
      "<!-- @include includenewline.txt -->\r" +
      "b\r";
    pp.preprocess(input, {srcDir: "test/fixtures/include"}).should.equal("a\r!foobar!\r\rb\r");
  });

  it('and convert EOLs from included files into EOLs from target file when using @include-static', function () {
    input = "a\r" +
      "<!-- @include-static includenewline.txt -->\r" +
      "b\r";
    pp.preprocess(input, {srcDir: "test/fixtures/include"}).should.equal("a\r!foobar!\r\rb\r");
  });

  it('and extend files and adapt all EOLs from file to be included to EOLs in target file when using @extend', function () {
    var helloSpy = chai.spy(hello);

    // extendadv.html has \r style EOLs
    input = "a\n<!-- @extend extendadv.html -->\nqa\n<!-- @endextend -->\n\nc";

    pp.preprocess(input, {
      srcDir: 'test/fixtures/extend',
      BLUE: "red",
      hello: helloSpy
    }).should.equal("a\na\n  b\n  red\n  Hello extend!\n  qa\nc\nc");
    helloSpy.should.have.been.called.with('extend');
  });
});