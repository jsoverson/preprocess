
var
  SP = '[ \\t]',
  NL_OPTIONAL = '(?:' + SP + '*\\n)?',
  NLS_OPTIONAL = '(?:' + SP + '*\\n+)?',
  IND = '^(.*?)', // indent (all cols from 0 col)

  ARGS = SP + '+(.+?)', // require separator(SPs)
  ARGS_OPTIONAL = '(?:' + ARGS + ')?',
  FUNC = ARGS + SP + '*\\((.*)\\)', // Not `\\((.*?)\\)`

  // ======================== html
  HTML_START = '<!--' + SP + '*', // include inside SPs
  HTML_SP_START = SP + '*' + HTML_START,
  HTML_IND_START = IND + HTML_START,
  HTML_END = SP + '*(?:-->|!>)', // include inside SPs
  HTML_END_NL = HTML_END + NL_OPTIONAL,
  HTML_END_NLS = HTML_END + NLS_OPTIONAL,

  // ======================== js
  _JS_START1 = '//',
  _JS_START2 = '/\\*',
  JS_START1 = _JS_START1 + SP + '*', // include inside SPs
  JS_START2 = _JS_START2 + SP + '*', // include inside SPs
  JS_START = '(?:' + _JS_START1 + '|' + _JS_START2 + ')' + SP + '*', // include inside SPs
  JS_SP_START = SP + '*' + JS_START,
  JS_IND_START1 = IND + JS_START1,
  JS_IND_START2 = IND + JS_START2,
  JS_END_LINE = SP + '*(?:\\*\\*|\\*/|$)', // include inside SPs
  _JS_END = '(?:\\*\\*|\\*/)',
  JS_END = SP + '*' + _JS_END, // include inside SPs
  JS_END_NL = SP + '*(?:' + _JS_END + NL_OPTIONAL + '|(?:\\n|$))', // include inside SPs
  JS_END_NLS = SP + '*(?:' + _JS_END + NLS_OPTIONAL + '|(?:\\n+|$))', // include inside SPs

  // ======================== coffee
  COFFEE_START = '#+' + SP + '*', // include inside SPs
  COFFEE_SP_START = SP + '*' + COFFEE_START,
  COFFEE_IND_START = IND + COFFEE_START,
  COFFEE_END_LINE = SP + '*$', // include inside SPs
  COFFEE_END_NL = SP + '*(?:\\n|$)', // include inside SPs
  COFFEE_END_NLS = SP + '*(?:\\n+|$)', // include inside SPs

  // ======================== directives
  DIR_ECHO =              '@echo' + ARGS,
  DIR_EXEC =              '@exec' + FUNC,
  DIR_INCLUDE =           '@include(?!-)' + ARGS,
  DIR_INCLUDE_STATIC =    '@include-static' + ARGS,
  DIR_EXCLUDE_START =     '@exclude' + ARGS_OPTIONAL,
  DIR_EXCLUDE_END =       '@endexclude',
  DIR_EXTEND_START =      '@extend(?!able)' + ARGS,
  DIR_EXTEND_END =        '@endextend',
  DIR_EXTENDABLE =        '@extendable',
  DIR_IF_START =          '@(ifndef|ifdef|if)' + ARGS,
  DIR_IF_END =            '@endif',
  DIR_FOREACH_START =     '@foreach' + ARGS,
  DIR_FOREACH_END =       '@endfor'
  ;

module.exports = {
  simple : {
    echo :              '^' +                   DIR_ECHO +              SP + '*$',
    exec :              '^' +                   DIR_EXEC +              SP + '*$',
    include :           IND +                   DIR_INCLUDE +           SP + '*$',
          // allow prefix characters to specify the indent level of included file
    'include-static' :  IND +                   DIR_INCLUDE_STATIC +    SP + '*$'
  },
  html : {
    echo :              HTML_START +            DIR_ECHO +              HTML_END,
    exec :              HTML_START +            DIR_EXEC +              HTML_END,
    include :           HTML_IND_START +        DIR_INCLUDE +           HTML_END,
    'include-static' :  HTML_IND_START +        DIR_INCLUDE_STATIC +    HTML_END,
    exclude : {
      start :           HTML_SP_START +         DIR_EXCLUDE_START +     HTML_END_NLS,
      end   :           HTML_SP_START +         DIR_EXCLUDE_END +       HTML_END_NL
    },
    extend : {
      start :           HTML_SP_START +         DIR_EXTEND_START +      HTML_END_NLS,
      end   :           HTML_SP_START +         DIR_EXTEND_END +        HTML_END_NL
    },
    extendable :        HTML_SP_START +         DIR_EXTENDABLE +        HTML_END,
    if : {
      start :           HTML_SP_START +         DIR_IF_START +          HTML_END_NLS,
      end   :           HTML_SP_START +         DIR_IF_END +            HTML_END_NL
    },
    foreach : {
      start :           HTML_SP_START +         DIR_FOREACH_START +     HTML_END_NLS,
      end   :           HTML_SP_START +         DIR_FOREACH_END +       HTML_END_NL
    }
  },
  js : {
    echo : [
                        JS_START1 +             DIR_ECHO +              JS_END_LINE,
                        JS_START2 +             DIR_ECHO +              JS_END_LINE
    ],
    exec :              JS_START +              DIR_EXEC +              JS_END_LINE,
    include : [
                        JS_IND_START1 +         DIR_INCLUDE +           JS_END_LINE,
                        JS_IND_START2 +         DIR_INCLUDE +           JS_END_LINE
    ],
    'include-static' : [
                        JS_IND_START1 +         DIR_INCLUDE_STATIC +    JS_END_LINE,
                        JS_IND_START2 +         DIR_INCLUDE_STATIC +    JS_END_LINE
    ],
    exclude : {
      start :           JS_SP_START +           DIR_EXCLUDE_START +     JS_END_NLS,
      end   :           JS_SP_START +           DIR_EXCLUDE_END +       JS_END_NL
    },
    extend : {
      start :           JS_SP_START +           DIR_EXTEND_START +      JS_END_NLS,
      end   :           JS_SP_START +           DIR_EXTEND_END +        JS_END_NL
    },
    extendable :        JS_SP_START +           DIR_EXTENDABLE +        JS_END_LINE,
    if : {
      start :           JS_SP_START +           DIR_IF_START +          JS_END_NLS,
      end   :           JS_SP_START +           DIR_IF_END +            JS_END_NL
    },
    foreach : {
      start :           JS_SP_START +           DIR_FOREACH_START +     JS_END_NLS,
      end   :           JS_SP_START +           DIR_FOREACH_END +       JS_END_NL
    }
  },
  coffee : {
    echo :              COFFEE_START +          DIR_ECHO +              COFFEE_END_LINE,
    exec :              COFFEE_START +          DIR_EXEC +              COFFEE_END_LINE,
    include :           COFFEE_IND_START +      DIR_INCLUDE +           COFFEE_END_LINE,
    'include-static' :  COFFEE_IND_START +      DIR_INCLUDE_STATIC +    COFFEE_END_LINE,
    exclude : {
      start :           COFFEE_SP_START +       DIR_EXCLUDE_START +     COFFEE_END_NLS,
      end   :           COFFEE_SP_START +       DIR_EXCLUDE_END +       COFFEE_END_NL
    },
    extend : {
      start :           COFFEE_SP_START +       DIR_EXTEND_START +      COFFEE_END_NLS,
      end   :           COFFEE_SP_START +       DIR_EXTEND_END +        COFFEE_END_NL
    },
    extendable :        COFFEE_SP_START +       DIR_EXTENDABLE +        COFFEE_END_LINE,
    if : {
      start :           COFFEE_SP_START +       DIR_IF_START +          COFFEE_END_NLS,
      end   :           COFFEE_SP_START +       DIR_IF_END +            COFFEE_END_NL
    },
    foreach : {
      start :           COFFEE_SP_START +       DIR_FOREACH_START +     COFFEE_END_NLS,
      end   :           COFFEE_SP_START +       DIR_FOREACH_END +       COFFEE_END_NL
    }
  }
};

module.exports.xml        = module.exports.html;

module.exports.javascript = module.exports.js;
module.exports.c          = module.exports.js;
module.exports.cc         = module.exports.js;
module.exports.cpp        = module.exports.js;
module.exports.cs         = module.exports.js;
module.exports.csharp     = module.exports.js;
module.exports.java       = module.exports.js;
module.exports.less       = module.exports.js;
module.exports.sass       = module.exports.js;
module.exports.scss       = module.exports.js;
module.exports.css        = module.exports.js;
module.exports.php        = module.exports.js;
module.exports.ts         = module.exports.js;
module.exports.peg        = module.exports.js;
module.exports.pegjs      = module.exports.js;
module.exports.jade       = module.exports.js;
module.exports.styl       = module.exports.js;

module.exports.coffee     = module.exports.coffee;
module.exports.bash       = module.exports.coffee;
module.exports.shell      = module.exports.coffee;
module.exports.sh         = module.exports.coffee;
