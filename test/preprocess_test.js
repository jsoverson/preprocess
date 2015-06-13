'use strict';

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

var pp = require('../lib/preprocess'),
    fs = require('fs');

function hello(test, expectedParamNumber) {
  test.equal(arguments.length - 2, expectedParamNumber, "Correct number of params have to be passed to function.");

  var names = Array.prototype.slice.call(arguments, 2);

  return 'Hello '+ names.join() +'!';
}

exports['preprocess'] = {
  setUp: function(done) {
    // setup here
    done();
  },
  'preprocess @if in html': function(test) {
    test.expect(12);

    // tests here

    var input,expected,settings;

    input = "a\n" +
      "<!-- @if NODE_ENV!='production' -->\n" +
      "b\n" +
      "<!-- @endif -->\n" +
      "c";
    expected = "a\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}), expected, 'Should exclude if match');

    input = "a\n" +
      "<!-- @if NODE_ENV!='production' -->\n" +
      "b\n" +
      "<!-- @endif -->\n" +
      "c";
    expected = "a\nb\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Should not exclude if not match');

    input = "a\n" +
      "<!-- @if NODE_ENV!='production' !>\n" +
      "b\n" +
      "<!-- @endif -->\n" +
      "c";
    expected = "a\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}), expected, 'Should exclude if match (bang)');

    input = "a\n" +
      "<!-- @if NODE_ENV!='production' !>\n" +
      "b\n" +
      "<!-- @endif -->\n" +
      "c";
    expected = "a\nb\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Should not exclude if not match (bang)');

    input = "a\n" +
      "<!-- @if NODE_ENV!='production' !>\n" +
      "b\n" +
      "<! @endif -->\n" +
      "c";
    expected = "a\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}), expected, 'Should exclude if match (bangbang)');

    input = "a\n" +
      "<!-- @if NODE_ENV!='production' !>\n" +
      "b\n" +
      "<! @endif -->\n" +
      "c";
    expected = "a\nb\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Should not exclude if not match (bangbang)');

    input = "a\n" +
      "<!-- @if NODE_ENV=='production' -->\n" +
      "b\n" +
      "<!-- @endif -->\n" +
      "c";
    expected = "a\nb\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}), expected, 'Should include if match');

    input = "a\n" +
      "<!-- @if NODE_ENV=='production' -->\n" +
      "b\n" +
      "<!-- @endif -->\n" +
      "c";
    expected = "a\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Should not include if not match');

    input = "a\n" +
      "<!-- @if NODE_ENV=='production' !>\n" +
      "b\n" +
      "<!-- @endif -->\n" +
      "c";
    expected = "a\nb\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}), expected, 'Should include if match (bang)');

    input = "a\n" +
      "<!-- @if NODE_ENV=='production' !>\n" +
      "b\n" +
      "<!-- @endif -->\n" +
      "c";
    expected = "a\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Should not include if not match (bang)');

    input = "a\n" +
      "<!-- @if NODE_ENV=='production' !>\n" +
      "b\n" +
      "<! @endif -->\n" +
      "c";
    expected = "a\nb\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}), expected, 'Should include if match (bangbang)');

    input = "a\n" +
      "<!-- @if NODE_ENV=='production' !>\n" +
      "b\n" +
      "<! @endif -->\n" +
      "c";
    expected = "a\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Should not include if not match (bangbang)');

    test.done();
  },
  'preprocess multiple @echo directives inline in html/js': function(test) {
    test.expect(4);

    var input,expected,settings;

    input = "a<!-- @echo FOO -->b<!-- @echo BAR -->c";
    expected = "a1b2c";
    test.equal(pp.preprocess(input, { FOO: 1, BAR : 2}), expected, 'Should process without overreaching');

    input = "a/* @echo FOO */b/* @echo BAR */c";
    expected = "a1b2c";
    test.equal(pp.preprocess(input, { FOO: 1, BAR : 2}, 'js'), expected, 'Should process without overreaching (js)');

    input = "a<!-- @echo '-*' -->b<!-- @echo '*-' -->c";
    expected = "a-*b*-c";
    test.equal(pp.preprocess(input), expected, 'Should process without overreaching when param contains - and * chars');

    input = "a/* @echo '-*' */b/* @echo '*-' */c";
    expected = "a-*b*-c";
    test.equal(pp.preprocess(input, {}, 'js'), expected, 'Should process without overreaching when param contains - and * chars (js)');

    test.done();
  },
  'preprocess @if in javascript': function(test) {
    test.expect(7);

    var input,expected;

    input = "a\n" +
      "// @if NODE_ENV!='production'\n" +
      "b\n" +
      "// @endif  \n" +
      "c";
    expected = "a\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}, 'js'), expected, 'Should exclude if match');


    input = "a\n" +
      "// @if NODE_ENV!='production' \n" +
      "b\n" +
      "// @endif \n" +
      "c";
    expected = "a\nb\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}, 'js'), expected, 'Should not exclude if not match');

    input = "a\n" +
      "// @if NODE_ENV=='production'\n" +
      "b\n" +
      "// @endif\n" +
      "c";
    expected = "a\nb\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}, 'js'), expected, 'Should include if match');


    input = "a\n" +
      "// @if NODE_ENV=='production'\n" +
      "b\n" +
      "// @endif\n" +
      "c";
    expected = "a\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}, 'js'), expected, 'Should not include if not match');

    input = "a/* @if NODE_ENV=='production' */b/* @endif */c";
    expected = "ac";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}, 'js'), expected, 'Should not include if not match');

    input = "a/* @if NODE_ENV=='production' **b/* @endif */c";
    expected = "abc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}, 'js'), expected, 'Should include if match (hidden by default syntax)');

    input = "a/* @if NODE_ENV=='production' **b/* @endif */c";
    expected = "ac";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}, 'js'), expected, 'Should not include if not match (hidden by default syntax)');

    test.done();
  },
  'preprocess @if in coffeescript': function(test) {
    test.expect(4);

    var input, expected, settings;

    input = "a\n" +
      "# @if NODE_ENV!='production'\n" +
      "b\n" +
      "# @endif  \n"+
      "c";
    expected = "a\nc";
    test.equal(pp.preprocess(input, {NODE_ENV: 'production'}, 'coffee'), expected, 'Should exclude if match');

    input = "a\n" +
      "# @if NODE_ENV!='production'\n" +
      "b\n" +
      "# @endif  \n"+
      "c";
    expected = "a\nb\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}, 'coffee'), expected, 'Should not exclude if not match');

    input = "a\n" +
      "# @if NODE_ENV=='production'\n" +
      "b\n" +
      "# @endif\n" +
      "c";
    expected = "a\nb\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}, 'coffee'), expected, 'Should include if match');


    input = "a\n" +
      "# @if NODE_ENV=='production'\n" +
      "b\n" +
      "# @endif\n" +
      "c";
    expected = "a\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}, 'coffee'), expected, 'Should not include if not match');

    test.done();
  },
  'preprocess @if in same line in html': function(test) {
    test.expect(12);

    // tests here

    var input,expected,settings;

    input = "a<!-- @if NODE_ENV!='production' -->b<!-- @endif -->c";
    expected = "ac";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}), expected, 'Should exclude if match');

    input = "a<!-- @if NODE_ENV!='production' -->b<!-- @endif -->c";
    expected = "abc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Should not exclude if not match');

    input = "a<!-- @if NODE_ENV!='production' !>b<!-- @endif -->c";
    expected = "ac";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}), expected, 'Should exclude if match (bang)');

    input = "a<!-- @if NODE_ENV!='production' !>b<!-- @endif -->c";
    expected = "abc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Should not exclude if not match (bang)');

    input = "a<!-- @if NODE_ENV!='production' !>b<! @endif -->c";
    expected = "ac";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}), expected, 'Should exclude if match (bangbang)');

    input = "a<!-- @if NODE_ENV!='production' !>b<! @endif -->c";
    expected = "abc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Should not exclude if not match (bangbang)');

    input = "a<!-- @if NODE_ENV=='production' -->b<!-- @endif -->c";
    expected = "abc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}), expected, 'Should include if match');

    input = "a<!-- @if NODE_ENV=='production' -->b<!-- @endif -->c";
    expected = "ac";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Should not include if not match');

    input = "a<!-- @if NODE_ENV=='production' !>b<!-- @endif -->c";
    expected = "abc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}), expected, 'Should include if match (bang)');

    input = "a<!-- @if NODE_ENV=='production' !>b<!-- @endif -->c";
    expected = "ac";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Should not include if not match (bang)');

    input = "a<!-- @if NODE_ENV=='production' !>b<! @endif -->c";
    expected = "abc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}), expected, 'Should include if match (bangbang)');

    input = "a<!-- @if NODE_ENV=='production' !>b<! @endif -->c";
    expected = "ac";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Should not include if not match (bangbang)');

    test.done();
  },
  'preprocess sequential @ifs in html': function(test) {
    test.expect(3);

    var input,expected,settings;

    input = "a<!-- @if NODE_ENV=='production' -->b<!-- @endif -->c" +
            "d<!-- @if NODE_ENV=='production' -->e<!-- @endif -->f";
    expected = "abcdef";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}), expected, 'Should process 2 sequential @ifs');

    input = "a<!-- @if NODE_ENV=='production' !>b<!-- @endif -->c" +
            "d<!-- @if NODE_ENV=='production' !>e<!-- @endif -->f";
    expected = "abcdef";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}), expected, 'Should process 2 sequential @ifs (bang)');

    input = "a<!-- @if NODE_ENV=='production' !>b<! @endif -->c" +
            "d<!-- @if NODE_ENV=='production' !>e<! @endif -->f";
    expected = "abcdef";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}), expected, 'Should process 2 sequential @ifs (bangbang)');

    test.done();
  },
  'preprocess @exclude': function(test) {
    test.expect(3);

    var input,expected,settings;

    input = "a<!-- @exclude -->b<!-- @endexclude -->c";
    expected = "ac";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}), expected, 'Should exclude');

    input = "a\n<!-- @exclude -->\nb\n<!-- @endexclude -->\nc";
    expected = "a\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}), expected, 'Should exclude with newlines');

    input = "var test = 1;\n// @exclude\nvar test = 4;\n// @endexclude\nvar test2 = 5;";
    expected = "var test = 1;\nvar test2 = 5;";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}, 'js'), expected, 'Should exclude js');

    test.done();
  },
  'force at least double equals for @if conditions': function(test) {
    test.expect(3);

    var input,expected,settings;

    input = "a<!-- @if NODE_ENV='production' -->b<!-- @endif -->c";
    expected = "ac";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Fail case, should not be included');

    input = "a<!-- @if NODE_ENV='production' !>b<!-- @endif -->c";
    expected = "ac";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Fail case, should not be included (bang)');

    input = "a<!-- @if NODE_ENV='production' !>b<! @endif -->c";
    expected = "ac";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Fail case, should not be included (bangbang)');

    test.done();
  },
  '@ifdef': function(test) {
    test.expect(8);

    var input,expected,settings;

    input = "a<!-- @ifdef NONEXISTANT -->b<!-- @endif -->c";
    expected = "ac";
    test.equal(pp.preprocess(input, { }), expected, 'Fail case, should not be included');

    input = "a<!-- @ifdef NODE_ENV -->b<!-- @endif -->c";
    expected = "abc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Success case, should be included');

    input = "a<!-- @ifdef NONEXISTANT !>b<!-- @endif -->c";
    expected = "ac";
    test.equal(pp.preprocess(input, { }), expected, 'Fail case, should not be included (bang)');

    input = "a<!-- @ifdef NODE_ENV !>b<!-- @endif -->c";
    expected = "abc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Success case, should be included (bang)');

    input = "a<!-- @ifdef NONEXISTANT !>b<! @endif -->c";
    expected = "ac";
    test.equal(pp.preprocess(input, { }), expected, 'Fail case, should not be included (bangbang)');

    input = "a<!-- @ifdef NODE_ENV !>b<! @endif -->c";
    expected = "abc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Success case, should be included (bangbang)');

    input = "a/* @ifdef NONEXISTANT */b/* @endif */c";
    expected = "ac";
    test.equal(pp.preprocess(input, { },'js'), expected, 'Fail case, should not be included');

    input = "a/* @ifdef NODE_ENV */b/* @endif */c";
    expected = "abc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'},'js'), expected, 'Success case, should be included');

    test.done();
  },
  '@ifndef': function(test) {
    test.expect(8);

    var input,expected,settings;

    input = "a<!-- @ifndef NONEXISTANT -->b<!-- @endif -->c";
    expected = "abc";
    test.equal(pp.preprocess(input, { }), expected, 'Fail case, should not be included');

    input = "a<!-- @ifndef NODE_ENV -->b<!-- @endif -->c";
    expected = "ac";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Success case, should be included');

    input = "a<!-- @ifndef NONEXISTANT !>b<!-- @endif -->c";
    expected = "abc";
    test.equal(pp.preprocess(input, { }), expected, 'Fail case, should not be included (bang)');

    input = "a<!-- @ifndef NODE_ENV !>b<!-- @endif -->c";
    expected = "ac";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Success case, should be included (bang)');

    input = "a<!-- @ifndef NONEXISTANT !>b<! @endif -->c";
    expected = "abc";
    test.equal(pp.preprocess(input, { }), expected, 'Fail case, should not be included (bangbang)');

    input = "a<!-- @ifndef NODE_ENV !>b<! @endif -->c";
    expected = "ac";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Success case, should be included (bangbang)');

    input = "a/* @ifndef NONEXISTANT */b/* @endif */c";
    expected = "abc";
    test.equal(pp.preprocess(input, { },'js'), expected, 'Fail case, should not be included');

    input = "a/* @ifndef NODE_ENV */b/* @endif */c";
    expected = "ac";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'},'js'), expected, 'Success case, should be included');

    test.done();
  },
  '@include files': function(test) {
    test.expect(10);

    var input,expected;
    input = "a<!-- @include include.html -->c";
    expected = "a!foobar!!bazqux!c";
    test.equal(pp.preprocess(input, { srcDir : 'test'}), expected, 'Should include files');

    input = "a<!-- @include includenewline.txt -->c";
    expected = "a!foobar!\n c";
    test.equal(pp.preprocess(input, { srcDir : 'test'}), expected, 'Should include files and indent if ending with a newline');

    input = "a/* @include include.block.js */c";
    expected = "a!foobar!!bazqux!c";
    test.equal(pp.preprocess(input, { srcDir : 'test'},'js'), expected, 'Should include files (js, block)');

    input = "a/* @include includenewline.txt */c";
    expected = "a!foobar!\n c";
    test.equal(pp.preprocess(input, { srcDir : 'test'},'js'), expected, 'Should include files and indent if ending with a newline (js, block)');

    input = "a\n// @include include.js\nc";
    expected = "a\n!foobar!\n!bazqux!\nc";
    test.equal(pp.preprocess(input, { srcDir : 'test'}, 'js'), expected, 'Should include files (js, line)');

    input = "a\n // @include includenewline.txt\nc";
    expected = "a\n !foobar!\n \nc";
    test.equal(pp.preprocess(input, { srcDir : 'test'}, 'js'), expected, 'Should include files and indent if ending with a newline (js, line)');

    input = "a\n@include include.txt\nc";
    expected = "a\n!foobar!\n!bazqux!\nc";
    test.equal(pp.preprocess(input, { srcDir : 'test'},'simple'), expected, 'Should include files (simple)');

    input = "a\n @include includenewline.txt\nc";
    expected = "a\n !foobar!\n \nc";
    test.equal(pp.preprocess(input, { srcDir : 'test'},'simple'), expected, 'Should include files and indent if ending with a newline (simple)');

    input = "a\n# @include include.coffee\nc";
    expected = "a\n!foobar!\n!bazqux!\nc";
    test.equal(pp.preprocess(input, { srcDir : 'test'},'coffee'), expected, 'Should include files (coffee)');

    input = "a\n # @include includenewline.txt\nc";
    expected = "a\n !foobar!\n \nc";
    test.equal(pp.preprocess(input, { srcDir : 'test'},'coffee'), expected, 'Should include files and indent if ending with a newline (coffee)');

    test.done();
  },
  '@include-static files': function(test) {
    test.expect(10);

    var input,expected;
    input = "a<!-- @include-static include.html -->c";
    expected = "a!foobar!<!-- @include static.txt -->c";
    test.equal(pp.preprocess(input, { srcDir : 'test'}), expected, 'Should include files, but not recursively');

    input = "a<!-- @include-static includenewline.txt -->c";
    expected = "a!foobar!\n c";
    test.equal(pp.preprocess(input, { srcDir : 'test'}), expected, 'Should include-static files and indent if ending with a newline, just like @include');

    input = "a/* @include-static include.block.js */c";
    expected = "a!foobar!/* @include static.txt */c";
    test.equal(pp.preprocess(input, { srcDir : 'test'},'js'), expected, 'Should include files (js, block), but not recursively');

    input = "a/* @include-static includenewline.txt */c";
    expected = "a!foobar!\n c";
    test.equal(pp.preprocess(input, { srcDir : 'test'},'js'), expected, 'Should include-static files and indent if ending with a newline (js, block), just like @include');

    input = "a\n// @include-static include.js\nc";
    expected = "a\n!foobar!\n// @include static.txt\nc";
    test.equal(pp.preprocess(input, { srcDir : 'test'},'js'), expected, 'Should include files (js, line), but not recursively');

    input = "a\n // @include-static includenewline.txt\nc";
    expected = "a\n !foobar!\n \nc";
    test.equal(pp.preprocess(input, { srcDir : 'test'},'js'), expected, 'Should include-static files and indent if ending with a newline (js, line), just like @include');

    input = "a\n@include-static include.txt\nc";
    expected = "a\n!foobar!\n@include static.txt\nc";
    test.equal(pp.preprocess(input, { srcDir : 'test'},'simple'), expected, 'Should include files (simple), but not recursively');

    input = "a\n @include-static includenewline.txt\nc";
    expected = "a\n !foobar!\n \nc";
    test.equal(pp.preprocess(input, { srcDir : 'test'},'simple'), expected, 'Should include files and indent if ending with a newline (simple), just like @include');

    input = "a\n# @include-static include.coffee\nc";
    expected = "a\n!foobar!\n# @include static.txt\nc";
    test.equal(pp.preprocess(input, { srcDir : 'test'},'coffee'), expected, 'Should include files (coffee), but not recursively');

    input = "a\n # @include-static includenewline.txt\nc";
    expected = "a\n !foobar!\n \nc";
    test.equal(pp.preprocess(input, { srcDir : 'test'},'coffee'), expected, 'Should include files and indent if ending with a newline (coffee), just like @include');

    test.done();
  },
  '@extend files': function(test) {
    test.expect(3);

    var input,expected,settings;
    input = "<!-- @extend extend.html -->qr<!-- @endextend -->";
    expected = "aqrb";
    test.equal(pp.preprocess(input, { srcDir : 'test'}), expected, 'Should extend files');

    input = "<!-- @extend extend.html -->\nqa\n<!-- @endextend -->";
    expected = "aqab";
    test.equal(pp.preprocess(input, { srcDir : 'test'}), expected, 'Should extend files while stripping newlines from inserted content');

    input = "<!-- @extend extendadv.html -->\nqa\n<!-- @endextend -->";
    expected = "a\r  b\r  red\r  qa\rc";
    test.equal(pp.preprocess(input, { srcDir : 'test', BLUE: "red"}), expected,
      'Should extend files while preserving newlines in target file');

    test.done();
  },
  '@echo': function(test) {
    test.expect(10);

    var input,expected;

    input = "a<!-- @echo FINGERPRINT -->c";
    expected = "a0xDEADBEEFc";
    test.equal(pp.preprocess(input, {FINGERPRINT: '0xDEADBEEF'}), expected, 'Should resolve and echo variables');

    input = "a<!-- @echo '-FOO*' -->c";
    expected = "a-FOO*c";
    test.equal(pp.preprocess(input), expected, 'Should echo strings');

    input = "a/* @echo FINGERPRINT */c";
    expected = "a0xDEADBEEFc";
    test.equal(pp.preprocess(input, {FINGERPRINT: '0xDEADBEEF'}, 'js'), expected, 'Should resolve and echo variables (js, block)');

    input = "a/* @echo '-FOO*' */c";
    expected = "a-FOO*c";
    test.equal(pp.preprocess(input, {}, 'js'), expected, 'Should echo strings (js, block)');

    input = "a\n// @echo FINGERPRINT\nc";
    expected = "a\n0xDEADBEEF\nc";
    test.equal(pp.preprocess(input, {FINGERPRINT: '0xDEADBEEF'}, 'js'), expected, 'Should resolve and echo variables (js, line)');

    input = "a\n// @echo '-FOO*'\nc";
    expected = "a\n-FOO*\nc";
    test.equal(pp.preprocess(input, {}, 'js'), expected, 'Should echo strings (js, line)');

    input = "a\n@echo FINGERPRINT\nc";
    expected = "a\n0xDEADBEEF\nc";
    test.equal(pp.preprocess(input, {FINGERPRINT: '0xDEADBEEF'}, 'simple'), expected, 'Should resolve and echo variables (simple)');

    input = "a\n@echo '-FOO*'\nc";
    expected = "a\n-FOO*\nc";
    test.equal(pp.preprocess(input,{},'simple'), expected, 'Should echo strings (simple)');

    input = "a\n# @echo FINGERPRINT\nc";
    expected = "a\n0xDEADBEEF\nc";
    test.equal(pp.preprocess(input, {FINGERPRINT: '0xDEADBEEF'}, 'coffee'), expected, 'Should resolve and echo variables (coffee)');

    input = "a\n# @echo '-FOO*'\nc";
    expected = "a\n-FOO*\nc";
    test.equal(pp.preprocess(input,{},'coffee'), expected, 'Should echo strings (coffee)');

    test.done();
  },
  '@foreach with array': function(test) {
    test.expect(4);

    var input,expected,settings;

    input = "<!-- @foreach $ITEM in LIST -->$ITEM<!-- @endfor -->";
    expected = "a";
    test.equal(pp.preprocess(input, { LIST: ['a'].toString()}), expected, 'Should run basic loop from Array with one item');

    input = "<!-- @foreach $ITEM in LIST -->$ITEM<!-- @endfor -->";
    expected = "ab";
    test.equal(pp.preprocess(input, { LIST: ['a','b'].toString()}), expected, 'Should run basic loop from Array with two items');

    input = "<!-- @foreach $ITEM in LIST -->$ITEM<!-- @endfor -->";
    expected = "ab";
    test.equal(pp.preprocess(input, { LIST: "a,b"}), expected, 'Should run basic loop from Stringified list');

    input = "<!-- @foreach $ITEM in LIST -->$ITEM<!-- @endfor -->";
    expected = "ab";
    test.equal(pp.preprocess(input, { LIST: "['a','b']"}), expected, 'Should run basic loop String Presented Formatted Array');

    test.done();
  },
  '@foreach with object': function(test) {
    test.expect(2);

    var input,expected,settings;

    input = "<!-- @foreach $ITEM in LIST -->$ITEM<!-- @endfor -->";
    expected = "ab";
    test.equal(pp.preprocess(input, { LIST: '{"itemOne": "a", "itemTwo": "b"}'}), expected, 'Should run basic loop from Object with two items');

    input = "<!-- @foreach $ITEM in LIST -->$ITEM<!-- @endfor -->";
    expected = "ab";
    test.equal(pp.preprocess(input, { LIST: JSON.stringify({'itemOne': 'a', 'itemTwo': 'b'})}), expected, 'Should run basic loop from Object with two items');

    test.done();
  },
  '@foreach mixing': function(test) {
    test.expect(4);

    var input,expected,settings;

    input = "<!-- @foreach $ITEM in LIST -->ab<!-- @endfor -->";
    expected = "abab";
    test.equal(pp.preprocess(input, { LIST: JSON.stringify({'itemOne': 'a', 'itemTwo': 'b'})}), expected, 'Should run basic loop just repeating content');

    input = "<!-- @foreach $ITEM in LIST --><div class='<!-- @echo LIST_CLASS -->'>$ITEM</div><!-- @endfor -->";
    expected = "<div class='list'>a</div><div class='list'>b</div>";
    test.equal(pp.preprocess(input, { LIST: ['a','b'].toString(), LIST_CLASS: 'list' }), expected, 'Duplicate loop with echo variable included in each');

    input = "<!-- @foreach $ITEM in LIST -->a<!-- @ifdef NOVAR -->$ITEM<!-- @endif --><!-- @endfor -->";
    expected = "aa";
    test.equal(pp.preprocess(input, { LIST: ['a','b'].toString(), LIST_CLASS: 'list' }), expected, 'Loop with ifdef');

    input = "<!-- @foreach $ITEM in LIST -->a<!-- @ifndef NOVAR -->$ITEM<!-- @endif --><!-- @endfor -->";
    expected = "aaab";
    test.equal(pp.preprocess(input, { LIST: ['a','b'].toString(), LIST_CLASS: 'list' }), expected, 'Loop with ifndef');

    test.done();
  },
  '@exec': function(test) {
    test.expect(30);

    var input,expected;

    input = "a<!-- @exec hello('Chuck Norris') -->c";
    expected = "aHello Chuck Norris!c";
    test.equal(pp.preprocess(input, {hello: hello.bind(null, test, 1)}), expected, 'Should execute exec statement with one parameter');

    input = "a<!-- @exec hello(\"Chuck Norris\", 'Gandhi') -->c";
    expected = "aHello Chuck Norris,Gandhi!c";
    test.equal(pp.preprocess(input, {hello: hello.bind(null, test, 2)}), expected, 'Should execute exec statement with two parameters');

    input = "a<!-- @exec hello(\"Chuck Norris\", buddy) -->c";
    expected = "aHello Chuck Norris,Michael Jackson!c";
    test.equal(pp.preprocess(input, {hello: hello.bind(null, test, 2), buddy: 'Michael Jackson'}), expected, 'Should execute exec statement with two parameters: one string and one variable');

    input = "a/* @exec hello('Chuck Norris') */c";
    expected = "aHello Chuck Norris!c";
    test.equal(pp.preprocess(input, {hello: hello.bind(null, test, 1)}, 'js'), expected, 'Should execute exec statement with one parameter (js, block comment)');

    input = "a/* @exec hello(\"Chuck Norris\", 'Gandhi') */c";
    expected = "aHello Chuck Norris,Gandhi!c";
    test.equal(pp.preprocess(input, {hello: hello.bind(null, test, 2)}, 'js'), expected, 'Should execute exec statement with two parameters (js, block comment)');

    input = "a/* @exec hello(\"Chuck Norris\", buddy) */c";
    expected = "aHello Chuck Norris,Michael Jackson!c";
    test.equal(pp.preprocess(input, {hello: hello.bind(null, test, 2), buddy: 'Michael Jackson'}, 'js'), expected, 'Should execute exec statement with two parameters: one string and one variable (js, block comment)');

    input = "a\n// @exec hello('Chuck Norris')\nc";
    expected = "a\nHello Chuck Norris!\nc";
    test.equal(pp.preprocess(input, {hello: hello.bind(null, test, 1)}, 'js'), expected, 'Should execute exec statement with one parameter (js, line comment)');

    input = "a\n// @exec hello(\"Chuck Norris\", 'Gandhi')\nc";
    expected = "a\nHello Chuck Norris,Gandhi!\nc";
    test.equal(pp.preprocess(input, {hello: hello.bind(null, test, 2)}, 'js'), expected, 'Should execute exec statement with two parameters (js, line comment)');

    input = "a\n// @exec hello(\"Chuck Norris\", buddy)\nc";
    expected = "a\nHello Chuck Norris,Michael Jackson!\nc";
    test.equal(pp.preprocess(input, {hello: hello.bind(null, test, 2), buddy: 'Michael Jackson'}, 'js'), expected, 'Should execute exec statement with two parameters: one string and one variable (js, line comment)');

    input = "a\n@exec hello('Chuck Norris')\nc";
    expected = "a\nHello Chuck Norris!\nc";
    test.equal(pp.preprocess(input, {hello: hello.bind(null, test, 1)}, 'simple'), expected, 'Should execute exec statement with one parameter (simple)');

    input = "a\n@exec hello(\"Chuck Norris\", 'Gandhi')\nc";
    expected = "a\nHello Chuck Norris,Gandhi!\nc";
    test.equal(pp.preprocess(input, {hello: hello.bind(null, test, 2)}, 'simple'), expected, 'Should execute exec statement with two parameters (simple)');

    input = "a\n@exec hello(\"Chuck Norris\", buddy)\nc";
    expected = "a\nHello Chuck Norris,Michael Jackson!\nc";
    test.equal(pp.preprocess(input, {hello: hello.bind(null, test, 2), buddy: 'Michael Jackson'}, 'simple'), expected, 'Should execute exec statement with two parameters: one string and one variable (simple)');

    input = "a\n# @exec hello('Chuck Norris')\nc";
    expected = "a\nHello Chuck Norris!\nc";
    test.equal(pp.preprocess(input, {hello: hello.bind(null, test, 1)}, 'coffee'), expected, 'Should execute exec statement with one parameter (coffee)');

    input = "a\n# @exec hello(\"Chuck Norris\", 'Gandhi')\nc";
    expected = "a\nHello Chuck Norris,Gandhi!\nc";
    test.equal(pp.preprocess(input, {hello: hello.bind(null, test, 2)}, 'coffee'), expected, 'Should execute exec statement with two parameters (coffee)');

    input = "a\n# @exec hello(\"Chuck Norris\", buddy)\nc";
    expected = "a\nHello Chuck Norris,Michael Jackson!\nc";
    test.equal(pp.preprocess(input, {hello: hello.bind(null, test, 2), buddy: 'Michael Jackson'}, 'coffee'), expected, 'Should execute exec statement with two parameters: one string and one variable (coffee)');

    test.done();
  },
  'default to env': function(test) {
    test.expect(1);

    var input,expected,settings;

    input = "a<!-- @echo FINGERPRINT -->c";
    expected = "a0xDEADBEEFc";
    process.env.FINGERPRINT = '0xDEADBEEF';

    test.equal(pp.preprocess(input), expected, 'Should include echo statement');

    test.done();
  },
  'processFile': function(test) {
    test.expect(1);

    var input,expected,settings;

    expected = "a0xDEADBEEFb";
    pp.preprocessFile('test/fixtures/processFileTest.html', 'test/tmp/processFileTest.dest.html', { TEST : '0xDEADBEEF'}, function(){
      test.equal(fs.readFileSync('test/tmp/processFileTest.dest.html').toString(), expected, 'Should process a file to disk');

      test.done();
    })
  },
  'processFileSync': function(test) {
    test.expect(1);

    var input,expected,settings;

    expected = "aa0xDEADBEEFbb";
    pp.preprocessFileSync('test/fixtures/processFileSyncTest.html', 'test/tmp/processFileSyncTest.dest.html', { TEST : '0xDEADBEEF'});
    var actual = fs.readFileSync('test/tmp/processFileSyncTest.dest.html').toString();
    test.equal(actual, expected, 'Should process a file to disk');
    test.done();
  },
  'multilevelContext': function(test) {
    test.expect(3);

    var input,expected,settings;
    var context = {'FOO' :{'BAR':'test'}};

    input = "// @echo FOO.BAR";
    expected = "test";
    test.equal(pp.preprocess(input, context, 'js'), expected, 'Should echo multi-level context');

    input = "// @echo FOO";
    expected = "[object Object]";
    test.equal(pp.preprocess(input, context, 'js'), expected, 'Should maintain backwards compatibility');

    input = "a\n" +
      "// @if FOO.BAR=='test' \n" +
      "b\n" +
      "// @endif \n" +
      "c";
    expected = "a\nb\nc";
    test.equal(pp.preprocess(input, context, 'js'), expected, 'Should compare multi-level context');

    test.done();
  }
};
