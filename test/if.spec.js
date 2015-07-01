'use strict';

var chai = require('chai'),
  pp = require('../lib/preprocess');

chai.should();

describe('@if directive shall be preprocessed', function () {
  describe('in html', function () {

    ['!=', '!=='].forEach(function (unEqualsOp) {
      describe('and should work with unequality operator `' + unEqualsOp + '`', function () {
        describe('with common comment syntax', function () {
          var input = "a\n" +
            "<!-- @if NODE_ENV" + unEqualsOp + "'production' -->\n" +
            "b\n" +
            "<!-- @endif -->\n" +
            "c";

          it('and exclude when condition evals to false', function () {
            pp.preprocess(input, {NODE_ENV: 'production'}).should.equal("a\nc");
          });

          it('and not exclude if condition evals to true', function () {
            pp.preprocess(input, {NODE_ENV: 'dev'}).should.equal("a\nb\nc");
          });
        });


        describe('with comment hidden by default syntax (end tag)', function () {
          var input = "a\n" +
            "<!-- @if NODE_ENV" + unEqualsOp + "'production' !>\n" +
            "b\n" +
            "<!-- @endif -->\n" +
            "c";

          it('and exclude when condition evals to false', function () {
            pp.preprocess(input, {NODE_ENV: 'production'}).should.equal("a\nc");
          });

          it('and not exclude if condition evals to true', function () {
            pp.preprocess(input, {NODE_ENV: 'dev'}).should.equal("a\nb\nc");
          });
        });

        describe('with comment hidden by default syntax (end tag and start tag)', function () {
          var input = "a\n" +
            "<!-- @if NODE_ENV" + unEqualsOp + "'production' !>\n" +
            "b\n" +
            "<! @endif -->\n" +
            "c";

          it('and exclude when condition evals to false', function () {
            pp.preprocess(input, {NODE_ENV: 'production'}).should.equal("a\nc");
          });

          it('and not exclude if condition evals to true', function () {
            pp.preprocess(input, {NODE_ENV: 'dev'}).should.equal("a\nb\nc");
          });
        });
      });
    });

    ['=', '==', '==='].forEach(function (equalsOp) {
      describe('and should work with equality operator `' + equalsOp + '`', function () {
        describe('with common comment syntax', function () {
          var input = "a\n" +
            "<!-- @if NODE_ENV" + equalsOp + "'production' -->\n" +
            "b\n" +
            "<!-- @endif -->\n" +
            "c";

          it('and exclude when condition evals to false', function () {
            pp.preprocess(input, {NODE_ENV: 'dev'}).should.equal("a\nc");
          });

          it('and not exclude if condition evals to true', function () {
            pp.preprocess(input, {NODE_ENV: 'production'}).should.equal("a\nb\nc");
          });
        });

        describe('with comment hidden by default syntax (end tag)', function () {
          var input = "a\n" +
            "<!-- @if NODE_ENV" + equalsOp + "'production' !>\n" +
            "b\n" +
            "<!-- @endif -->\n" +
            "c";

          it('and exclude when condition evals to false', function () {
            pp.preprocess(input, {NODE_ENV: 'dev'}).should.equal("a\nc");
          });

          it('and not exclude if condition evals to true', function () {
            pp.preprocess(input, {NODE_ENV: 'production'}).should.equal("a\nb\nc");
          });
        });

        describe('with comment hidden by default syntax (end tag and start tag)', function () {
          var input = "a\n" +
            "<!-- @if NODE_ENV" + equalsOp + "'production' !>\n" +
            "b\n" +
            "<! @endif -->\n" +
            "c";

          it('and exclude when condition evals to false', function () {
            pp.preprocess(input, {NODE_ENV: 'dev'}).should.equal("a\nc");
          });

          it('and not exclude if condition evals to true', function () {
            pp.preprocess(input, {NODE_ENV: 'production'}).should.equal("a\nb\nc");
          });
        });
      });
    });
  });

  describe('in javascript', function () {
    describe('and should work with unequality operator', function () {
      var input = "a\n" +
        "// @if NODE_ENV!='production' \n" +
        "b\n" +
        "// @endif \n" +
        "c";

      it('and exclude when condition evals to false', function () {
        pp.preprocess(input, {NODE_ENV: 'production'}, 'js').should.equal("a\nc");
      });

      it('and not exclude when condition evals to false', function () {
        pp.preprocess(input, {NODE_ENV: 'dev'}, 'js').should.equal("a\nb\nc");
      });
    });

    describe('and should work with equality operator', function () {
      var input = "a\n" +
        "// @if NODE_ENV=='production'\n" +
        "b\n" +
        "// @endif\n" +
        "c";

      it('and not exclude when condition evals to true', function () {
        pp.preprocess(input, {NODE_ENV: 'production'}, 'js').should.equal("a\nb\nc");
      });

      it('and exclude when condition evals to false', function () {
        pp.preprocess(input, {NODE_ENV: 'dev'}, 'js').should.equal("a\nc");
      });
    });

    it("should exclude if not match (block)", function () {
      var input = "a/* @if NODE_ENV=='production' */b/* @endif */c";
      pp.preprocess(input, {NODE_ENV: 'dev'}, 'js').should.equal("ac");
    });

    it('should not exclude if match (hidden by default syntax)', function () {
      var input = "a/* @if NODE_ENV=='production' **b/* @endif */c";
      pp.preprocess(input, {NODE_ENV: 'production'}, 'js').should.equal("abc");
    });

    it('should support nesting (block)', function () {
      var input = "a/* @if true */b/* @if false */bad/* @endif */c/* @if true */d/* @endif */e/* @endif */f";
      pp.preprocess(input, {}, 'js').should.equal("abcdef");
    });

    it('should support nesting (line)', function () {
      var input = "a\n" +
        "// @if true\n" +
        "b\n" +
        "// @if false\n" +
        "bad\n" +
        "// @endif\n" +
        "c\n" +
        "// @if true\n" +
        "d\n" +
        "// @endif\n" +
        "e\n" +
        "// @endif\n" +
        "f";
      pp.preprocess(input, {}, 'js').should.equal("a\nb\nc\nd\ne\nf");
    });
  });

  describe('in coffeescript', function () {
    describe('and should work with unequality operator', function () {
      var input = "a\n" +
        "# @if NODE_ENV!='production'\n" +
        "b\n" +
        "# @endif  \n" +
        "c";

      it('and exclude when condition evals to false', function () {
        pp.preprocess(input, {NODE_ENV: 'production'}, 'coffee').should.equal("a\nc");
      });

      it('and not exclude when condition evals to false', function () {
        pp.preprocess(input, {NODE_ENV: 'dev'}, 'coffee').should.equal("a\nb\nc");
      });
    });

    describe('and should work with equality operator', function () {
      var input = "a\n" +
        "# @if NODE_ENV=='production'\n" +
        "b\n" +
        "# @endif\n" +
        "c";

      it('and not exclude when condition evals to true', function () {
        pp.preprocess(input, {NODE_ENV: 'production'}, 'coffee').should.equal("a\nb\nc");
      });

      it('and exclude when condition evals to false', function () {
        pp.preprocess(input, {NODE_ENV: 'dev'}, 'coffee').should.equal("a\nc");
      });
    });

    it('and should not overreach upon matching', function () {
      var input =
        "    ## @if NODE_ENV == 'development'\n" +
        "    host = 'localhost'\n" +
        "    protocol = 'http'\n" +
        "    port = 3001\n" +
        "    ## @endif\n" +
        "\n" +
        "    console.log \"Socket info\", protocol, host, port";
      var expected =
        "    host = 'localhost'\n" +
        "    protocol = 'http'\n" +
        "    port = 3001\n" +
        "\n" +
        "    console.log \"Socket info\", protocol, host, port";
      pp.preprocess(input, {NODE_ENV: 'development'}, 'coffee').should.equal(expected);
    });
  });

  describe('in same line in html', function () {
    describe('and should work with unequality operator', function () {
      describe('with common comment syntax', function () {
        var input = "a<!-- @if NODE_ENV!='production' -->b<!-- @endif -->c";

        it('and exclude when condition evals to false', function () {
          pp.preprocess(input, {NODE_ENV: 'production'}).should.equal("ac");
        });

        it('and not exclude if condition evals to true', function () {
          pp.preprocess(input, {NODE_ENV: 'dev'}).should.equal("abc");
        });
      });

      describe('with comment hidden by default syntax (end tag)', function () {
        var input = "a<!-- @if NODE_ENV!='production' !>b<!-- @endif -->c";

        it('and exclude when condition evals to false', function () {
          pp.preprocess(input, {NODE_ENV: 'production'}).should.equal("ac");
        });

        it('and not exclude if condition evals to true', function () {
          pp.preprocess(input, {NODE_ENV: 'dev'}).should.equal("abc");
        });
      });

      describe('with comment hidden by default syntax (end tag and start tag)', function () {
        var input = "a<!-- @if NODE_ENV!='production' !>b<! @endif -->c";

        it('and exclude when condition evals to false', function () {
          pp.preprocess(input, {NODE_ENV: 'production'}).should.equal("ac");
        });

        it('and not exclude if condition evals to true', function () {
          pp.preprocess(input, {NODE_ENV: 'dev'}).should.equal("abc");
        });
      });
    });

    describe('and should work with equality operator', function () {
      describe('with common comment syntax', function () {
        var input = "a<!-- @if NODE_ENV=='production' -->b<!-- @endif -->c";

        it('and exclude when condition evals to false', function () {
          pp.preprocess(input, {NODE_ENV: 'dev'}).should.equal("ac");
        });

        it('and not exclude if condition evals to true', function () {
          pp.preprocess(input, {NODE_ENV: 'production'}).should.equal("abc");
        });
      });

      describe('with comment hidden by default syntax (end tag)', function () {
        var input = "a<!-- @if NODE_ENV=='production' !>b<!-- @endif -->c";

        it('and exclude when condition evals to false', function () {
          pp.preprocess(input, {NODE_ENV: 'dev'}).should.equal("ac");
        });

        it('and not exclude if condition evals to true', function () {
          pp.preprocess(input, {NODE_ENV: 'production'}).should.equal("abc");
        });
      });

      describe('with comment hidden by default syntax (end tag and start tag)', function () {
        var input = "a<!-- @if NODE_ENV=='production' !>b<! @endif -->c";

        it('and exclude when condition evals to false', function () {
          pp.preprocess(input, {NODE_ENV: 'dev'}).should.equal("ac");
        });

        it('and not exclude if condition evals to true', function () {
          pp.preprocess(input, {NODE_ENV: 'production'}).should.equal("abc");
        });
      });
    });
  });

  describe('sequentially following each other in html', function () {
    it('2 in sequence in common comment syntax', function () {
      var input = "a<!-- @if NODE_ENV=='production' -->b<!-- @endif -->c" +
        "d<!-- @if NODE_ENV=='production' -->e<!-- @endif -->f";
      pp.preprocess(input, {NODE_ENV: 'production'}).should.equal("abcdef");
    });

    it('2 in sequence in hidden by default syntax (end tag)', function () {
      var input = "a<!-- @if NODE_ENV=='production' !>b<!-- @endif -->c" +
        "d<!-- @if NODE_ENV=='production' !>e<!-- @endif -->f";
      pp.preprocess(input, {NODE_ENV: 'production'}).should.equal("abcdef");
    });

    it('2 in sequence in hidden by default syntax (end tag and start tag)', function () {
      var input = "a<!-- @if NODE_ENV=='production' !>b<! @endif -->c" +
        "d<!-- @if NODE_ENV=='production' !>e<! @endif -->f";
      pp.preprocess(input, {NODE_ENV: 'production'}).should.equal("abcdef");
    });
  });

  describe('and shall allow omitting of whitespaces', function () {
    var input;

    it('in html before and after the directive', function () {
      var input = "<!--@if NODE_ENV=='production'-->b<!--@endif-->";
      pp.preprocess(input, {NODE_ENV: 'production'}).should.equal("b");
    });

    describe('in javascript', function () {
      it('before and after the directive (block)', function () {
        input = "/*@if NODE_ENV=='production'*/b/*@endif*/";
        pp.preprocess(input, {NODE_ENV: 'production'}, 'js').should.equal("b");
      });

      it('before the directive (line)', function () {
        input = "//@if NODE_ENV=='production'\n" +
          "b\n" +
          "//@endif";
        pp.preprocess(input, {NODE_ENV: 'production'}, 'js').should.equal("b\n");
      });
    });

    it('in coffeescript before the directive', function () {
      var input = "#@if NODE_ENV=='production'\n" +
        "b\n" +
        "#@endif";
      pp.preprocess(input, {NODE_ENV: 'production'}, 'coffee').should.equal("b\n");
    });
  });
});