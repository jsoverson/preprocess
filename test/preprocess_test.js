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
    test.expect(6);

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

    test.done();
  },
  'preprocess @if in coffeescript': function(test) {
    test.expect(5);

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

    input =
      "    ## @if NODE_ENV == 'development'\n" +
      "    host = 'localhost'\n" +
      "    protocol = 'http'\n" +
      "    port = 3001\n" +
      "    ## @endif\n" +
      "\n" +
      "    console.log \"Socket info\", protocol, host, port";
    expected =
      "    host = 'localhost'\n" +
      "    protocol = 'http'\n" +
      "    port = 3001\n" +
      "    console.log \"Socket info\", protocol, host, port";
    test.equal(pp.preprocess(input, { NODE_ENV: 'development'}, 'coffee'), expected, 'Should not include if not match');

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
    test.expect(8);

    var input,expected;

    input = "a<!-- @exclude -->b<!-- @endexclude -->c";
    expected = "ac";
    test.equal(pp.preprocess(input, {}), expected, 'Should exclude');

    input = "a<!-- @exclude -->b<!-- @endexclude -->c<!-- @exclude -->d<!-- @endexclude -->e";
    expected = "ace";
    test.equal(pp.preprocess(input, {}), expected, 'Should exclude multiple excludes in one line');

    input = "a\n<!-- @exclude -->\nb\n<!-- @endexclude -->\nc";
    expected = "a\nc";
    test.equal(pp.preprocess(input, {}), expected, 'Should exclude with newlines');

    input = "a\n// @exclude\nb\n// @endexclude\nc";
    expected = "a\nc";
    test.equal(pp.preprocess(input, {}, 'js'), expected, 'Should exclude (js, line)');

    input = "a/* @exclude */b/* @endexclude */c";
    expected = "ac";
    test.equal(pp.preprocess(input, {}, 'js'), expected, 'Should exclude (js, block)');

    input = "a\n/* @exclude */\nb\n/* @endexclude */\nc";
    expected = "a\nc";
    test.equal(pp.preprocess(input, {}, 'js'), expected, 'Should exclude with newlines (js, block)');

    input = "a\n# @exclude\nb\n# @endexclude\nc";
    expected = "a\nc";
    test.equal(pp.preprocess(input, {}, 'coffee'), expected, 'Should exclude (coffee)');

    input = "a\n## @exclude\nb\n## @endexclude\nc";
    expected = "a\nc";
    test.equal(pp.preprocess(input, {}, 'coffee'), expected, 'Should exclude (coffee, multiple hashes)');

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
    test.expect(11);

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

    input =
      "a\n" +
      "# @ifdef FLAG\n" +
      "b\n" +
      "# @endif\n" +
      "c";
    expected = "a\nc";
    test.equal(pp.preprocess(input, { },'coffee'), expected, 'Fail case, should not be included (coffee)');

    input =
      "a\n" +
      "## @ifdef FLAG\n" +
      "b\n" +
      "## @endif\n" +
      "c";
    expected = "a\nc";
    test.equal(pp.preprocess(input, { },'coffee'), expected, 'Fail case, should not be included (coffee, multiple hashes)');

    input =
      "a\n" +
      "# @ifdef FLAG\n" +
      "b\n" +
      "# @endif\n" +
      "c";
    expected = "a\nb\nc";
    test.equal(pp.preprocess(input, {FLAG: 1 },'coffee'), expected, 'Success case, should be included (coffee)');

    test.done();
  },
  '@ifndef': function(test) {
    test.expect(11);

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

    input =
      "a\n" +
      "# @ifndef FLAG\n" +
      "b\n" +
      "# @endif\n" +
      "c";
    expected = "a\nb\nc";
    test.equal(pp.preprocess(input, { },'coffee'), expected, 'Success case, should be included (coffee)');

    input =
      "a\n" +
      "## @ifndef FLAG\n" +
      "b\n" +
      "## @endif\n" +
      "c";
    expected = "a\nb\nc";
    test.equal(pp.preprocess(input, { },'coffee'), expected, 'Success case, should be included (coffee, multiple hashes)');

    input =
      "a\n" +
      "# @ifndef FLAG\n" +
      "b\n" +
      "# @endif\n" +
      "c";
    expected = "a\nc";
    test.equal(pp.preprocess(input, {FLAG: 1 },'coffee'), expected, 'Fail case, should not be included (coffee)');

    test.done();
  },
  '@include files': function(test) {
    test.expect(17);

    var input,expected;
    input = "a<!-- @include include.html -->c";
    expected = "a!foobar!Hello html!!bazqux!c";
    test.equal(pp.preprocess(input, { srcDir : 'test', hello: hello.bind(null, test, 1)}), expected, 'Should include files');

    input = "a<!-- @include includenewline.txt -->c";
    expected = "a!foobar!\n c";
    test.equal(pp.preprocess(input, { srcDir : 'test'}), expected, 'Should include files and indent if ending with a newline');

    input = "a/* @include include.block.js */c";
    expected = "a!foobar!Hello js!\n !bazqux!c";
    test.equal(pp.preprocess(input, { srcDir : 'test', hello: hello.bind(null, test, 1)},'js'), expected, 'Should include files (js, block)');

    input = "a/* @include includenewline.txt */c";
    expected = "a!foobar!\n c";
    test.equal(pp.preprocess(input, { srcDir : 'test'},'js'), expected, 'Should include files and indent if ending with a newline (js, block)');

    input = "a\n// @include include.js\nc";
    expected = "a\n!foobar!\nHello js!\n!bazqux!\nc";
    test.equal(pp.preprocess(input, { srcDir : 'test', hello: hello.bind(null, test, 1)}, 'js'), expected, 'Should include files (js, line)');

    input = "a\n // @include includenewline.txt\nc";
    expected = "a\n !foobar!\n \nc";
    test.equal(pp.preprocess(input, { srcDir : 'test'}, 'js'), expected, 'Should include files and indent if ending with a newline (js, line)');

    input = "a\n@include include.txt\nc";
    expected = "a\n!foobar!\nHello simple!\n!bazqux!\nc";
    test.equal(pp.preprocess(input, { srcDir : 'test', hello: hello.bind(null, test, 1)},'simple'), expected, 'Should include files (simple)');

    input = "a\n @include includenewline.txt\nc";
    expected = "a\n !foobar!\n \nc";
    test.equal(pp.preprocess(input, { srcDir : 'test'},'simple'), expected, 'Should include files and indent if ending with a newline (simple)');

    input = "a\n# @include include.coffee\nc";
    expected = "a\n!foobar!\nHello coffee!\n!bazqux!\nc";
    test.equal(pp.preprocess(input, { srcDir : 'test', hello: hello.bind(null, test, 1)},'coffee'), expected, 'Should include files (coffee)');

    input = "a\n## @include include.coffee\nc";
    expected = "a\n!foobar!\nHello coffee!\n!bazqux!\nc";
    test.equal(pp.preprocess(input, { srcDir : 'test', hello: hello.bind(null, test, 1)},'coffee'), expected, 'Should include files (coffee, multiple hashes)');

    input = "a\n # @include includenewline.txt\nc";
    expected = "a\n !foobar!\n \nc";
    test.equal(pp.preprocess(input, { srcDir : 'test'},'coffee'), expected, 'Should include files and indent if ending with a newline (coffee)');

    test.done();
  },
  '@include-static files': function(test) {
    test.expect(11);

    var input,expected;
    input = "a<!-- @include-static include.html -->c";
    expected = "a!foobar!<!-- @exec hello('html') --><!-- @include static.txt -->c";
    test.equal(pp.preprocess(input, { srcDir : 'test', hello: hello.bind(null, test, 1)}), expected, 'Should include files, but not recursively');

    input = "a<!-- @include-static includenewline.txt -->c";
    expected = "a!foobar!\n c";
    test.equal(pp.preprocess(input, { srcDir : 'test'}), expected, 'Should include-static files and indent if ending with a newline, just like @include');

    input = "a/* @include-static include.block.js */c";
    expected = "a!foobar!/* @exec hello('js') */\n /* @include static.txt */c";
    test.equal(pp.preprocess(input, { srcDir : 'test', hello: hello.bind(null, test, 1)},'js'), expected, 'Should include files (js, block), but not recursively');

    input = "a/* @include-static includenewline.txt */c";
    expected = "a!foobar!\n c";
    test.equal(pp.preprocess(input, { srcDir : 'test'},'js'), expected, 'Should include-static files and indent if ending with a newline (js, block), just like @include');

    input = "a\n// @include-static include.js\nc";
    expected = "a\n!foobar!\n// @exec hello('js')\n// @include static.txt\nc";
    test.equal(pp.preprocess(input, { srcDir : 'test', hello: hello.bind(null, test, 1)},'js'), expected, 'Should include files (js, line), but not recursively');

    input = "a\n // @include-static includenewline.txt\nc";
    expected = "a\n !foobar!\n \nc";
    test.equal(pp.preprocess(input, { srcDir : 'test'},'js'), expected, 'Should include-static files and indent if ending with a newline (js, line), just like @include');

    input = "a\n@include-static include.txt\nc";
    expected = "a\n!foobar!\n@exec hello('simple')\n@include static.txt\nc";
    test.equal(pp.preprocess(input, { srcDir : 'test', hello: hello.bind(null, test, 1)},'simple'), expected, 'Should include files (simple), but not recursively');

    input = "a\n @include-static includenewline.txt\nc";
    expected = "a\n !foobar!\n \nc";
    test.equal(pp.preprocess(input, { srcDir : 'test'},'simple'), expected, 'Should include files and indent if ending with a newline (simple), just like @include');

    input = "a\n# @include-static include.coffee\nc";
    expected = "a\n!foobar!\n# @exec hello('coffee')\n# @include static.txt\nc";
    test.equal(pp.preprocess(input, { srcDir : 'test', hello: hello.bind(null, test, 1)},'coffee'), expected, 'Should include files (coffee), but not recursively');

    input = "a\n## @include-static include.coffee\nc";
    expected = "a\n!foobar!\n# @exec hello('coffee')\n# @include static.txt\nc";
    test.equal(pp.preprocess(input, { srcDir : 'test', hello: hello.bind(null, test, 1)},'coffee'), expected, 'Should include files (coffee, multiple hashes), but not recursively');

    input = "a\n # @include-static includenewline.txt\nc";
    expected = "a\n !foobar!\n \nc";
    test.equal(pp.preprocess(input, { srcDir : 'test'},'coffee'), expected, 'Should include files and indent if ending with a newline (coffee), just like @include');

    test.done();
  },
  '@extend files': function(test) {
    test.expect(11);

    var input,expected;

    input = "<!-- @extend extend.html -->qr<!-- @endextend -->";
    expected = "aqrb";
    test.equal(pp.preprocess(input, { srcDir : 'test'}), expected, 'Should extend files');

    input = "x<!-- @extend extend.html -->qr<!-- @endextend -->y<!-- @extend extend.html -->hi<!-- @endextend -->z";
    expected = "xaqrbyahibz";
    test.equal(pp.preprocess(input, { srcDir : 'test'}), expected, 'Should extend files with multiple extends in one line');

    input = "<!-- @extend extend.html -->\nqa\n<!-- @endextend -->";
    expected = "aqab";
    test.equal(pp.preprocess(input, { srcDir : 'test'}), expected, 'Should extend files while stripping newlines from inserted content');

    input = "<!-- @extend extendadv.html -->\nqa\n<!-- @endextend -->";
    expected = "a\r  b\r  red\r  Hello extend!\r  qa\rc";
    test.equal(pp.preprocess(input, { srcDir : 'test', BLUE: "red", hello: hello.bind(null, test, 1)}), expected,
      'Should extend files while preserving newlines in target file');

    input = "/* @extend extend.js */qr/* @endextend */";
    expected = "aqrb";
    test.equal(pp.preprocess(input, { srcDir : 'test'}, 'js'), expected, 'Should extend files (js, block)');

    input = "x/* @extend extend.js */qr/* @endextend */y/* @extend extend.js */hi/* @endextend */z";
    expected = "xaqrbyahibz";
    test.equal(pp.preprocess(input, { srcDir : 'test'}, 'js'), expected, 'Should extend files with multiple extends in one line (js, block)');

    input = "/* @extend extend.js */\nqa\n/* @endextend */";
    expected = "aqab";
    test.equal(pp.preprocess(input, { srcDir : 'test'}, 'js'), expected, 'Should extend files while stripping newlines from inserted content (js, block)');

    input = "// @extend extend.js\nqr\n// @endextend";
    expected = "aqrb";
    test.equal(pp.preprocess(input, { srcDir : 'test'}, 'js'), expected, 'Should extend files while stripping newlines from inserted content (js, line)');

    input = "# @extend extend.coffee\nqr\n# @endextend";
    expected = "a\nqr\nb";
    test.equal(pp.preprocess(input, { srcDir : 'test'}, 'coffee'), expected, 'Should extend files while stripping newlines from inserted content (coffee)');

    input = "## @extend extend.coffee\nqr\n## @endextend";
    expected = "a\nqr\nb";
    test.equal(pp.preprocess(input, { srcDir : 'test'}, 'coffee'), expected, 'Should extend files while stripping newlines from inserted content (coffee, multiple hashes)');

    test.done();
  },
  '@echo': function(test) {
    test.expect(11);

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

    input = "a\n## @echo FINGERPRINT\nc";
    expected = "a\n0xDEADBEEF\nc";
    test.equal(pp.preprocess(input, {FINGERPRINT: '0xDEADBEEF'}, 'coffee'), expected, 'Should resolve and echo variables (coffee, multiple hashes)');

    input = "a\n# @echo '-FOO*'\nc";
    expected = "a\n-FOO*\nc";
    test.equal(pp.preprocess(input,{},'coffee'), expected, 'Should echo strings (coffee)');

    test.done();
  },
  '@foreach with array': function(test) {
    test.expect(7);

    var input,expected;

    input = "<!-- @foreach $ITEM in LIST -->$ITEM<!-- @endfor -->";
    expected = "a";
    test.equal(pp.preprocess(input, { LIST: ['a'].toString()}), expected, 'Should run basic loop from Array with one item');

    input = "<!-- @foreach $ITEM in LIST -->$ITEM<!-- @endfor -->";
    expected = "ab";
    test.equal(pp.preprocess(input, { LIST: ['a','b'].toString()}), expected, 'Should run basic loop from stringified Array with two items');

    input = "<!-- @foreach $ITEM in LIST -->$ITEM<!-- @endfor -->";
    expected = "ab";
    test.equal(pp.preprocess(input, { LIST: "['a','b']"}), expected, 'Should run basic loop string presented formatted Array');

    input = "/* @foreach $ITEM in LIST */$ITEM/* @endfor */";
    expected = "ab";
    test.equal(pp.preprocess(input, { LIST: ['a','b'].toString()}, 'js'), expected, 'Should run basic loop string presented formatted Array (js, block)');

    input = "// @foreach $ITEM in LIST\n$ITEM\n// @endfor";
    expected = "a\nb\n";
    test.equal(pp.preprocess(input, { LIST: ['a','b'].toString()}, 'js'), expected, 'Should run basic loop string presented formatted Array (js, line)');

    input = "# @foreach $ITEM in LIST\n$ITEM\n# @endfor";
    expected = "a\nb\n";
    test.equal(pp.preprocess(input, { LIST: ['a','b'].toString()}, 'coffee'), expected, 'Should run basic loop string presented formatted Array (coffee)');

    input = "## @foreach $ITEM in LIST\n$ITEM\n## @endfor";
    expected = "a\nb\n";
    test.equal(pp.preprocess(input, { LIST: ['a','b'].toString()}, 'coffee'), expected, 'Should run basic loop string presented formatted Array (coffee, multiple hashes)');

    test.done();
  },
  '@foreach with object': function(test) {
    test.expect(6);

    var input,expected;

    input = "<!-- @foreach $ITEM in LIST -->ab<!-- @endfor -->";
    expected = "abab";
    test.equal(pp.preprocess(input, { LIST: '{"itemOne": "a", "itemTwo": "b"}'}), expected, 'Should run basic loop just repeating content');

    input = "<!-- @foreach $ITEM in LIST -->$ITEM<!-- @endfor -->";
    expected = "ab";
    test.equal(pp.preprocess(input, { LIST: '{"itemOne": "a", "itemTwo": "b"}'}), expected, 'Should run basic loop from Object with two items');

    input = "/* @foreach $ITEM in LIST */$ITEM/* @endfor */";
    expected = "ab";
    test.equal(pp.preprocess(input, { LIST: '{"itemOne": "a", "itemTwo": "b"}'}, 'js'), expected, 'Should run basic loop from Object with two items (js, block)');

    input = "// @foreach $ITEM in LIST\n$ITEM\n// @endfor";
    expected = "a\nb\n";
    test.equal(pp.preprocess(input, { LIST: '{"itemOne": "a", "itemTwo": "b"}'}, 'js'), expected, 'Should run basic loop from Object with two items (js, line)');

    input = "# @foreach $ITEM in LIST\n$ITEM\n# @endfor";
    expected = "a\nb\n";
    test.equal(pp.preprocess(input, { LIST: '{"itemOne": "a", "itemTwo": "b"}'}, 'coffee'), expected, 'Should run basic loop from Object with two items (coffee)');

    input = "## @foreach $ITEM in LIST\n$ITEM\n## @endfor";
    expected = "a\nb\n";
    test.equal(pp.preprocess(input, { LIST: '{"itemOne": "a", "itemTwo": "b"}'}, 'coffee'), expected, 'Should run basic loop from Object with two items (coffee, multiple hashes)');

    test.done();
  },
  '@foreach mixing': function(test) {
    test.expect(15);

    var input,expected;

    input = "<!-- @foreach $ITEM in LIST --><div class='<!-- @echo LIST_CLASS -->'>$ITEM</div><!-- @endfor -->";
    expected = "<div class='list'>a</div><div class='list'>b</div>";
    test.equal(pp.preprocess(input, { LIST: ['a','b'].toString(), LIST_CLASS: 'list' }), expected, 'Duplicate loop with echo variable included in each');

    input = "<!-- @foreach $ITEM in LIST -->a<!-- @ifdef NOVAR -->$ITEM<!-- @endif --><!-- @endfor -->";
    expected = "aa";
    test.equal(pp.preprocess(input, { LIST: ['a','b'].toString() }), expected, 'Loop with ifdef');

    input = "<!-- @foreach $ITEM in LIST -->a<!-- @ifndef NOVAR -->$ITEM<!-- @endif --><!-- @endfor -->";
    expected = "aaab";
    test.equal(pp.preprocess(input, { LIST: ['a','b'].toString() }), expected, 'Loop with ifndef');

    input = "/* @foreach $ITEM in LIST *//* @echo LIST_CLASS */$ITEM/* @endfor */";
    expected = "listalistb";
    test.equal(pp.preprocess(input, { LIST: ['a','b'].toString(), LIST_CLASS: 'list' }, 'js'), expected, 'Duplicate loop with echo variable included in each (js, block)');

    input = "/* @foreach $ITEM in LIST */a/* @ifdef NOVAR */$ITEM/* @endif *//* @endfor */";
    expected = "aa";
    test.equal(pp.preprocess(input, { LIST: ['a','b'].toString() }, 'js'), expected, 'Loop with ifdef (js, block)');

    input = "/* @foreach $ITEM in LIST */a/* @ifndef NOVAR */$ITEM/* @endif *//* @endfor */";
    expected = "aaab";
    test.equal(pp.preprocess(input, { LIST: ['a','b'].toString() }, 'js'), expected, 'Loop with ifndef (js, block)');

    input = "// @foreach $ITEM in LIST\n// @echo LIST_CLASS\n$ITEM\n// @endfor";
    expected = "list\na\nlist\nb\n";
    test.equal(pp.preprocess(input, { LIST: ['a','b'].toString(), LIST_CLASS: 'list' }, 'js'), expected, 'Duplicate loop with echo variable included in each (js, line)');

    input = "// @foreach $ITEM in LIST\na\n// @ifdef NOVAR\n$ITEM\n// @endif\n// @endfor";
    expected = "a\na\n";
    test.equal(pp.preprocess(input, { LIST: ['a','b'].toString() }, 'js'), expected, 'Loop with ifdef (js, line)');

    input = "// @foreach $ITEM in LIST\na\n// @ifndef NOVAR\n$ITEM\n// @endif\n// @endfor";
    expected = "a\na\na\nb\n";
    test.equal(pp.preprocess(input, { LIST: ['a','b'].toString() }, 'js'), expected, 'Loop with ifndef (js, line)');

    input = "# @foreach $ITEM in LIST\n# @echo LIST_CLASS\n$ITEM\n# @endfor";
    expected = "list\na\nlist\nb\n";
    test.equal(pp.preprocess(input, { LIST: ['a','b'].toString(), LIST_CLASS: 'list' }, 'coffee'), expected, 'Duplicate loop with echo variable included in each (coffee)');

    input = "## @foreach $ITEM in LIST\n## @echo LIST_CLASS\n$ITEM\n## @endfor";
    expected = "list\na\nlist\nb\n";
    test.equal(pp.preprocess(input, { LIST: ['a','b'].toString(), LIST_CLASS: 'list' }, 'coffee'), expected, 'Duplicate loop with echo variable included in each (coffee, multiple hashes)');

    input = "# @foreach $ITEM in LIST\na\n# @ifdef NOVAR\n$ITEM\n# @endif\n# @endfor";
    expected = "a\na\n";
    test.equal(pp.preprocess(input, { LIST: ['a','b'].toString() }, 'coffee'), expected, 'Loop with ifdef (coffee)');

    input = "## @foreach $ITEM in LIST\na\n## @ifdef NOVAR\n$ITEM\n## @endif\n## @endfor";
    expected = "a\na\n";
    test.equal(pp.preprocess(input, { LIST: ['a','b'].toString() }, 'coffee'), expected, 'Loop with ifdef (coffee, multiple hashes)');

    input = "# @foreach $ITEM in LIST\na\n# @ifndef NOVAR\n$ITEM\n# @endif\n# @endfor";
    expected = "a\na\na\nb\n";
    test.equal(pp.preprocess(input, { LIST: ['a','b'].toString() }, 'coffee'), expected, 'Loop with ifndef (coffee)');

    input = "## @foreach $ITEM in LIST\na\n## @ifndef NOVAR\n$ITEM\n## @endif\n## @endfor";
    expected = "a\na\na\nb\n";
    test.equal(pp.preprocess(input, { LIST: ['a','b'].toString() }, 'coffee'), expected, 'Loop with ifndef (coffee, multiple hashes)');

    test.done();
  },
  '@exec': function(test) {
    test.expect(32);

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

    input = "a\n## @exec hello(\"Chuck Norris\", 'Gandhi')\nc";
    expected = "a\nHello Chuck Norris,Gandhi!\nc";
    test.equal(pp.preprocess(input, {hello: hello.bind(null, test, 2)}, 'coffee'), expected, 'Should execute exec statement with two parameters (coffee, multiple hashes)');

    input = "a\n# @exec hello(\"Chuck Norris\", buddy)\nc";
    expected = "a\nHello Chuck Norris,Michael Jackson!\nc";
    test.equal(pp.preprocess(input, {hello: hello.bind(null, test, 2), buddy: 'Michael Jackson'}, 'coffee'), expected, 'Should execute exec statement with two parameters: one string and one variable (coffee)');

    test.done();
  },
  'preprocess javascript (hidden by default syntax)': function(test) {
    test.expect(11);

    var input,expected;

    input = "a/* @if NODE_ENV=='dev' ** /* @echo 'b' ** /* @endif */c";
    expected = "a bc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}, 'js'), expected, 'Should process @if and exec nested @echo');

    input = "a/* @if NODE_ENV=='dev' ** /* @exec hello('b') ** /* @endif */c";
    expected = "a Hello b!c";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev', hello: hello.bind(null, test, 1)}, 'js'), expected, 'Should process @if and exec nested @exec');

    input = "a/* @if NODE_ENV=='dev' ** /* @include static.txt ** /* @endif */c";
    expected = "a !bazqux!c";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev', srcDir: 'test'}, 'js'), expected, 'Should process @if and exec nested @include');

    input = "a/* @if NODE_ENV=='dev' ** /* @include-static static.txt ** /* @endif */c";
    expected = "a !bazqux!c";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev', srcDir: 'test'}, 'js'), expected, 'Should process @if and exec nested @include-static');

    input = "a/* @if NODE_ENV=='dev' ** /* @exclude ** b /* @endexclude ** /* @endif */c";
    expected = "ac";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}, 'js'), expected, 'Should process @if and exec nested @exclude');

    input = "a/* @if NODE_ENV=='dev' ** /* @extend extend.js **c/* @endextend ** /* @endif */c";
    expected = "aacbc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev', srcDir: 'test'}, 'js'), expected, 'Should process @if and exec nested @extend');

    input = "a/* @extend extend.js ** /* @if NODE_ENV=='dev' **c/* @endif ** /* @endextend */c";
    expected = "aacbc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev', srcDir: 'test'}, 'js'), expected, 'Should process @extend and exec nested @if');

    input = "a/* @extend extend.js ** /* @ifdef NODE_ENV **c/* @endif ** /* @endextend */c";
    expected = "aacbc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev', srcDir: 'test'}, 'js'), expected, 'Should process @extend and exec nested @ifdef');

    input = "a/* @extend extend.js ** /* @ifndef NODE_ENV **c/* @endif ** /* @endextend */c";
    expected = "aabc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev', srcDir: 'test'}, 'js'), expected, 'Should process @extend and exec nested @ifndef');

    input = "a/* @if NODE_ENV=='dev' ** /* @foreach $var in ARR **$var/* @endfor ** /* @endif */c";
    expected = "abcc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev', ARR: "['b', 'c']"}, 'js'), expected, 'Should process @if and exec nested @extend');

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
