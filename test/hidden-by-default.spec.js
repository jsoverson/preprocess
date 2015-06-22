'use strict';

var chai = require('chai'),
  pp = require('../lib/preprocess');

chai.should();

describe('hidden by default comment blocks shall be preprocessed', function () {
  var input;

  function hello(expectedParamNumber) {
    (arguments.length - 1).should.equal(expectedParamNumber);

    var names = Array.prototype.slice.call(arguments, 1);

    return 'Hello ' + names.join() + '!';
  }

  describe('in html', function () {
    it('and process @if and exec nested @echo', function () {
      input = "a<!-- @if NODE_ENV=='dev' !> <!-- @echo 'b' !> <!-- @endif -->c";
      pp.preprocess(input, {NODE_ENV: 'dev'}, 'html').should.equal("a bc");
    });

    it('and process @if and exec nested @exec', function () {
      input = "a<!-- @if NODE_ENV=='dev' !> <!-- @exec hello('b') !> <!-- @endif -->c";
      pp.preprocess(input, {NODE_ENV: 'dev', hello: hello.bind(null, 1)}, 'html').should.equal("a Hello b!c");
    });

    it('and process @if and exec nested @include', function () {
      input = "a<!-- @if NODE_ENV=='dev' !> <!-- @include static.txt !> <!-- @endif -->c";
      pp.preprocess(input, {NODE_ENV: 'dev', srcDir: 'test/fixtures/include'}, 'html').should.equal("a !bazqux!c");
    });

    it('and process @if and exec nested @include-static', function () {
      input = "a<!-- @if NODE_ENV=='dev' !> <!-- @include-static static.txt !> <!-- @endif -->c";
      pp.preprocess(input, {NODE_ENV: 'dev', srcDir: 'test/fixtures/include'}, 'html').should.equal("a !bazqux!c");
    });

    it('and process @if and exec nested @exclude', function () {
      input = "a<!-- @if NODE_ENV=='dev' !> <!-- @exclude !> b <!-- @endexclude !> <!-- @endif -->c";
      pp.preprocess(input, {NODE_ENV: 'dev'}, 'html').should.equal("ac");
    });

    it('and process @if and exec nested @extend', function () {
      input = "a<!-- @if NODE_ENV=='dev' !> <!-- @extend extend.html !>c<!-- @endextend !> <!-- @endif -->c";
      pp.preprocess(input, {NODE_ENV: 'dev', srcDir: 'test/fixtures/extend'}, 'html').should.equal("aacbc");
    });

    it('and process @extend and exec nested @if', function () {
      input = "a<!-- @extend extend.html !> <!-- @if NODE_ENV=='dev' !>c<!-- @endif !> <!-- @endextend -->c";
      pp.preprocess(input, {NODE_ENV: 'dev', srcDir: 'test/fixtures/extend'}, 'html').should.equal("aacbc");
    });

    it('and process @extend and exec nested @ifdef', function () {
      input = "a<!-- @extend extend.html !> <!-- @ifdef NODE_ENV !>c<!-- @endif !> <!-- @endextend -->c";
      pp.preprocess(input, {NODE_ENV: 'dev', srcDir: 'test/fixtures/extend'}, 'html').should.equal("aacbc");
    });

    it('and process @extend and exec nested @ifndef', function () {
      input = "a<!-- @extend extend.html !> <!-- @ifndef NODE_ENV !>c<!-- @endif !> <!-- @endextend -->c";
      pp.preprocess(input, {NODE_ENV: 'dev', srcDir: 'test/fixtures/extend'}, 'html').should.equal("aabc");
    });

    it('and process @if and exec nested @extend', function () {
      input = "a<!-- @if NODE_ENV=='dev' !> <!-- @foreach $var in ARR !>$var<!-- @endfor !> <!-- @endif -->c";
      pp.preprocess(input, {NODE_ENV: 'dev', ARR: "['b', 'c']"}, 'html').should.equal("abcc");
    });
  });

  describe('in javascript', function () {
    it('and process @if and exec nested @echo', function () {
      input = "a/* @if NODE_ENV=='dev' ** /* @echo 'b' ** /* @endif */c";
      pp.preprocess(input, {NODE_ENV: 'dev'}, 'js').should.equal("a bc");
    });

    it('and process @if and exec nested @exec', function () {
      input = "a/* @if NODE_ENV=='dev' ** /* @exec hello('b') ** /* @endif */c";
      pp.preprocess(input, {NODE_ENV: 'dev', hello: hello.bind(null, 1)}, 'js').should.equal("a Hello b!c");
    });

    it('and process @if and exec nested @include', function () {
      input = "a/* @if NODE_ENV=='dev' ** /* @include static.txt ** /* @endif */c";
      pp.preprocess(input, {NODE_ENV: 'dev', srcDir: 'test/fixtures/include'}, 'js').should.equal("a !bazqux!c");
    });

    it('and process @if and exec nested @include-static', function () {
      input = "a/* @if NODE_ENV=='dev' ** /* @include-static static.txt ** /* @endif */c";
      pp.preprocess(input, {NODE_ENV: 'dev', srcDir: 'test/fixtures/include'}, 'js').should.equal("a !bazqux!c");
    });

    it('and process @if and exec nested @exclude', function () {
      input = "a/* @if NODE_ENV=='dev' ** /* @exclude ** b /* @endexclude ** /* @endif */c";
      pp.preprocess(input, {NODE_ENV: 'dev'}, 'js').should.equal("ac");
    });

    it('and process @if and exec nested @extend', function () {
      input = "a/* @if NODE_ENV=='dev' ** /* @extend extend.js **c/* @endextend ** /* @endif */c";
      pp.preprocess(input, {NODE_ENV: 'dev', srcDir: 'test/fixtures/extend'}, 'js').should.equal("aacbc");
    });

    it('and process @extend and exec nested @if', function () {
      input = "a/* @extend extend.js ** /* @if NODE_ENV=='dev' **c/* @endif ** /* @endextend */c";
      pp.preprocess(input, {NODE_ENV: 'dev', srcDir: 'test/fixtures/extend'}, 'js').should.equal("aacbc");
    });

    it('and process @extend and exec nested @ifdef', function () {
      input = "a/* @extend extend.js ** /* @ifdef NODE_ENV **c/* @endif ** /* @endextend */c";
      pp.preprocess(input, {NODE_ENV: 'dev', srcDir: 'test/fixtures/extend'}, 'js').should.equal("aacbc");
    });

    it('and process @extend and exec nested @ifndef', function () {
      input = "a/* @extend extend.js ** /* @ifndef NODE_ENV **c/* @endif ** /* @endextend */c";
      pp.preprocess(input, {NODE_ENV: 'dev', srcDir: 'test/fixtures/extend'}, 'js').should.equal("aabc");
    });

    it('and process @if and exec nested @extend', function () {
      input = "a/* @if NODE_ENV=='dev' ** /* @foreach $var in ARR **$var/* @endfor ** /* @endif */c";
      pp.preprocess(input, {NODE_ENV: 'dev', ARR: "['b', 'c']"}, 'js').should.equal("abcc");
    });
  });
});