'use strict';

var chai = require('chai'),
  pp = require('../lib/preprocess');

chai.should();

describe('@foreach directive shall be preprocessed', function () {
  var input;

  describe('with array as input', function () {
    describe('in html', function () {
      it('and run basic loop with one item (array toString() form)', function () {
        input = "<!-- @foreach $ITEM in LIST -->$ITEM<!-- @endfor -->";
        pp.preprocess(input, {LIST: ['a'].toString()}).should.equal("a");
      });

      it('and run basic loop with multiple items (array toString() form)', function () {
        input = "<!-- @foreach $ITEM in LIST -->$ITEM<!-- @endfor -->";
        pp.preprocess(input, {LIST: ['a', 'b'].toString()}).should.equal("ab");
      });

      it('and run basic loop (JSON-like array form)', function () {
        input = "<!-- @foreach $ITEM in LIST -->$ITEM<!-- @endfor -->";
        pp.preprocess(input, {LIST: "['a','b']"}).should.equal("ab");
      });
    });

    describe('in javascript', function () {
      it('and run basic loop with multiple items (array toString() form, block)', function () {
        input = "/* @foreach $ITEM in LIST */$ITEM/* @endfor */";
        pp.preprocess(input, {LIST: ['a', 'b'].toString()}, 'js').should.equal("ab");
      });

      it('and run basic loop with multiple items (array toString() form, line)', function () {
        input = "// @foreach $ITEM in LIST\n$ITEM\n// @endfor";
        pp.preprocess(input, {LIST: ['a', 'b'].toString()}, 'js').should.equal("a\nb\n");
      });
    });

    describe('in coffeescript', function () {
      it('and run basic loop with multiple items (array toString() form)', function () {
        input = "# @foreach $ITEM in LIST\n$ITEM\n# @endfor";
        pp.preprocess(input, {LIST: ['a', 'b'].toString()}, 'coffee').should.equal("a\nb\n");
      });

      it('and run basic loop with multiple items (array toString() form, multiple hashes)', function () {
        input = "## @foreach $ITEM in LIST\n$ITEM\n## @endfor";
        pp.preprocess(input, {LIST: ['a', 'b'].toString()}, 'coffee').should.equal("a\nb\n");
      });
    });

    it('and support nested @foreach in javascript', function () {
      input = "/* @foreach $ITEMA in LIST *//* @foreach $ITEMB in LIST */$ITEMA$ITEMB/* @endfor *//* @endfor */";
      pp.preprocess(input, {LIST: ['a', 'b'].toString()}, 'js').should.equal("aaabbabb");
    });

    it('and support nested @foreach in coffeescript', function () {
      input = "## @foreach $ITEMA in LIST \n## @foreach $ITEMB in LIST \n$ITEMA$ITEMB\n## @endfor \n## @endfor";
      pp.preprocess(input, {LIST: ['a', 'b'].toString()}, 'coffee').should.equal("aa\nab\nba\nbb\n");
    });
  });

  describe('with object as input', function () {
    describe('in html', function () {
      it('and run basic loop just repeating content', function () {
        input = "<!-- @foreach $ITEM in LIST -->ab<!-- @endfor -->";
        pp.preprocess(input, {LIST: '{"itemOne": "a", "itemTwo": "b"}'}).should.equal("abab");
      });

      it('and run basic loop with multiple items', function () {
        input = "<!-- @foreach $ITEM in LIST -->$ITEM<!-- @endfor -->";
        pp.preprocess(input, {LIST: '{"itemOne": "a", "itemTwo": "b"}'}).should.equal("ab");
      });
    });

    describe('in javascript', function () {
      it('and run basic loop with multiple items (block)', function () {
        input = "/* @foreach $ITEM in LIST */$ITEM/* @endfor */";
        pp.preprocess(input, {LIST: '{"itemOne": "a", "itemTwo": "b"}'}, 'js').should.equal("ab");
      });

      it('and run basic loop with multiple items (line)', function () {
        input = "// @foreach $ITEM in LIST\n$ITEM\n// @endfor";
        pp.preprocess(input, {LIST: '{"itemOne": "a", "itemTwo": "b"}'}, 'js').should.equal("a\nb\n");
      });
    });

    describe('in coffeescript', function () {
      it('and run basic loop with multiple items', function () {
        input = "# @foreach $ITEM in LIST\n$ITEM\n# @endfor";
        pp.preprocess(input, {LIST: '{"itemOne": "a", "itemTwo": "b"}'}, 'coffee').should.equal("a\nb\n");
      });

      it('and run basic loop with multiple items (multiple hashes)', function () {
        input = "## @foreach $ITEM in LIST\n$ITEM\n## @endfor";
        pp.preprocess(input, {LIST: '{"itemOne": "a", "itemTwo": "b"}'}, 'coffee').should.equal("a\nb\n");
      });
    });
  });

  describe('with mixed input', function () {
    describe('in html', function () {
      it('duplicate loop with @echo variable included in each', function () {
        input = "<!-- @foreach $ITEM in LIST --><div class='<!-- @echo LIST_CLASS -->'>$ITEM</div><!-- @endfor -->";
        pp.preprocess(input, {
          LIST: ['a', 'b'].toString(),
          LIST_CLASS: 'list'
        }).should.equal("<div class='list'>a</div><div class='list'>b</div>");
      });

      it('loop with @ifdef', function () {
        input = "<!-- @foreach $ITEM in LIST -->a<!-- @ifdef NOVAR -->$ITEM<!-- @endif --><!-- @endfor -->";
        pp.preprocess(input, {LIST: ['a', 'b'].toString()}).should.equal("aa");
      });

      it('loop with @ifndef', function () {
        input = "<!-- @foreach $ITEM in LIST -->a<!-- @ifndef NOVAR -->$ITEM<!-- @endif --><!-- @endfor -->";
        pp.preprocess(input, {LIST: ['a', 'b'].toString()}).should.equal("aaab");
      });
    });

    describe('in javascript', function () {
      it('duplicate loop with @echo variable included in each (block)', function () {
        input = "/* @foreach $ITEM in LIST *//* @echo LIST_CLASS */$ITEM/* @endfor */";
        pp.preprocess(input, {LIST: ['a', 'b'].toString(), LIST_CLASS: 'list'}, 'js').should.equal("listalistb");
      });

      it('loop with @ifdef (block)', function () {
        input = "/* @foreach $ITEM in LIST */a/* @ifdef NOVAR */$ITEM/* @endif *//* @endfor */";
        pp.preprocess(input, {LIST: ['a', 'b'].toString()}, 'js').should.equal("aa");
      });

      it('loop with @ifndef (block)', function () {
        input = "/* @foreach $ITEM in LIST */a/* @ifndef NOVAR */$ITEM/* @endif *//* @endfor */";
        pp.preprocess(input, {LIST: ['a', 'b'].toString()}, 'js').should.equal("aaab");
      });

      it('duplicate loop with @echo variable included in each (line)', function () {
        input = "// @foreach $ITEM in LIST\n// @echo LIST_CLASS\n$ITEM\n// @endfor";
        pp.preprocess(input, {
          LIST: ['a', 'b'].toString(),
          LIST_CLASS: 'list'
        }, 'js').should.equal("list\na\nlist\nb\n");
      });

      it('loop with @ifdef (line)', function () {
        input = "// @foreach $ITEM in LIST\na\n// @ifdef NOVAR\n$ITEM\n// @endif\n// @endfor";
        pp.preprocess(input, {LIST: ['a', 'b'].toString()}, 'js').should.equal("a\na\n");
      });

      it('loop with @ifndef (line)', function () {
        input = "// @foreach $ITEM in LIST\na\n// @ifndef NOVAR\n$ITEM\n// @endif\n// @endfor";
        pp.preprocess(input, {LIST: ['a', 'b'].toString()}, 'js').should.equal("a\na\na\nb\n");
      });
    });

    describe('in coffeescript', function () {
      it('duplicate loop with @echo variable included in each', function () {
        input = "# @foreach $ITEM in LIST\n# @echo LIST_CLASS\n$ITEM\n# @endfor";
        pp.preprocess(input, {
          LIST: ['a', 'b'].toString(),
          LIST_CLASS: 'list'
        }, 'coffee').should.equal("list\na\nlist\nb\n");
      });

      it('duplicate loop with @echo variable included in each (multiple hashes)', function () {
        input = "## @foreach $ITEM in LIST\n## @echo LIST_CLASS\n$ITEM\n## @endfor";
        pp.preprocess(input, {
          LIST: ['a', 'b'].toString(),
          LIST_CLASS: 'list'
        }, 'coffee').should.equal("list\na\nlist\nb\n");
      });

      it('loop with @ifdef', function () {
        input = "# @foreach $ITEM in LIST\na\n# @ifdef NOVAR\n$ITEM\n# @endif\n# @endfor";
        pp.preprocess(input, {LIST: ['a', 'b'].toString()}, 'coffee').should.equal("a\na\n");
      });

      it('loop with @ifdef (multiple hashes)', function () {
        input = "## @foreach $ITEM in LIST\na\n## @ifdef NOVAR\n$ITEM\n## @endif\n## @endfor";
        pp.preprocess(input, {LIST: ['a', 'b'].toString()}, 'coffee').should.equal("a\na\n");
      });

      it('loop with @ifndef', function () {
        input = "# @foreach $ITEM in LIST\na\n# @ifndef NOVAR\n$ITEM\n# @endif\n# @endfor";
        pp.preprocess(input, {LIST: ['a', 'b'].toString()}, 'coffee').should.equal("a\na\na\nb\n");
      });

      it('loop with @ifndef (multiple hashes)', function () {
        input = "## @foreach $ITEM in LIST\na\n## @ifndef NOVAR\n$ITEM\n## @endif\n## @endfor";
        pp.preprocess(input, {LIST: ['a', 'b'].toString()}, 'coffee').should.equal("a\na\na\nb\n");
      });
    });
  });

  describe('and shall allow omitting of whitespaces', function () {
    it('in html before and after the directive', function () {
      input = "<!--@foreach $ITEM in LIST-->$ITEM<!--@endfor-->";
      pp.preprocess(input, {LIST: ['a'].toString()}).should.equal("a");
    });

    describe('in javascript', function () {
      it('before and after the directive (block)', function () {
        input = "/*@foreach $ITEM in LIST*/$ITEM/*@endfor*/";
        pp.preprocess(input, {LIST: ['a'].toString()}, 'js').should.equal("a");
      });

      it('before the directive (line)', function () {
        input = "//@foreach $ITEM in LIST\n$ITEM\n//@endfor";
        pp.preprocess(input, {LIST: ['a'].toString()}, 'js').should.equal("a\n");
      });
    });

    it('in coffeescript before the directive', function () {
      input = "#@foreach $ITEM in LIST\n$ITEM\n#@endfor";
      pp.preprocess(input, {LIST: ['a'].toString()}, 'coffee').should.equal("a\n");
    });
  });
});

