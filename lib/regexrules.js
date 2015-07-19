
var
  SP = '[ \\t]',
  NL_OPTIONAL = '(?:' + SP + '*\\n)?',
  NLS_OPTIONAL = '(?:' + SP + '*\\n+)?',
  IND = '^(.*?)', // indent (all cols from 0 col)

  ARGS = SP + '+(.+?)', // require separator(SPs)
  ARGS_OPTIONAL = '(?:' + ARGS + ')?',
  FUNC = ARGS + SP + '*\\((.*)\\)', // Not `\\((.*?)\\)`

  // ======================== html
  START_HTML = '<!--' + SP + '*', // include inside SPs
  SP_START_HTML = SP + '*' + START_HTML,
  IND_START_HTML = IND + START_HTML,
  END_HTML = SP + '*(?:-->|!>)',
  END_HTML_NL = END_HTML + NL_OPTIONAL,
  END_HTML_NLS = END_HTML + NLS_OPTIONAL,

  // ======================== js
  _START_JS1 = '//',
  _START_JS2 = '/\\*',
  START_JS1 = _START_JS1 + SP + '*', // include inside SPs
  START_JS2 = _START_JS2 + SP + '*', // include inside SPs
  START_JS = '(?:' + _START_JS1 + '|' + _START_JS2 + ')' + SP + '*', // include inside SPs
  SP_START_JS = SP + '*' + START_JS,
  IND_START_JS1 = IND + START_JS1,
  IND_START_JS2 = IND + START_JS2,
  END_JS_LINE = SP + '*(?:\\*\\*|\\*/|$)',
  _END_JS = '(?:\\*\\*|\\*/)',
  END_JS = SP + '*' + _END_JS,
  END_JS_NL = SP + '*(?:' + _END_JS + NL_OPTIONAL + '|(?:\\n|$))',
  END_JS_NLS = SP + '*(?:' + _END_JS + NLS_OPTIONAL + '|(?:\\n+|$))',

  // ======================== coffee
  START_COFFEE = '#+' + SP + '*', // include inside SPs
  SP_START_COFFEE = SP + '*' + START_COFFEE,
  IND_START_COFFEE = IND + START_COFFEE,
  END_COFFEE_LINE = SP + '*$',
  END_COFFEE_NL = SP + '*(?:\\n|$)',
  END_COFFEE_NLS = SP + '*(?:\\n+|$)',

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
    echo :              '^' +                   DIR_ECHO +              '[ \t]*$',
    exec :              '^' +                   DIR_EXEC +              '[ \t]*$',
    include :           IND +                   DIR_INCLUDE +           '[ \t]*$',
          // allow prefix characters to specify the indent level of included file
    'include-static' :  IND +                   DIR_INCLUDE_STATIC +    '[ \t]*$'
  },
  html : {
    echo :              START_HTML +            DIR_ECHO +              END_HTML,
    exec :              START_HTML +            DIR_EXEC +              END_HTML,
    include :           IND_START_HTML +        DIR_INCLUDE +           END_HTML,
    'include-static' :  IND_START_HTML +        DIR_INCLUDE_STATIC +    END_HTML,
    exclude : {
      start :           SP_START_HTML +         DIR_EXCLUDE_START +     END_HTML_NLS,
      end   :           SP_START_HTML +         DIR_EXCLUDE_END +       END_HTML_NL
    },
    extend : {
      start :           SP_START_HTML +         DIR_EXTEND_START +      END_HTML_NLS,
      end   :           SP_START_HTML +         DIR_EXTEND_END +        END_HTML_NL
    },
    extendable :        SP_START_HTML +         DIR_EXTENDABLE +        END_HTML,
    if : {
      start :           SP_START_HTML +         DIR_IF_START +          END_HTML_NLS,
      end   :           SP_START_HTML +         DIR_IF_END +            END_HTML_NL
    },
    foreach : {
      start :           SP_START_HTML +         DIR_FOREACH_START +     END_HTML_NLS,
      end   :           SP_START_HTML +         DIR_FOREACH_END +       END_HTML_NL
    }
  },
  js : {
    echo : [
                        START_JS1 +             DIR_ECHO +              END_JS_LINE,
                        START_JS2 +             DIR_ECHO +              END_JS_LINE
    ],
    exec :              START_JS +              DIR_EXEC +              END_JS_LINE,
    include : [
                        IND_START_JS1 +         DIR_INCLUDE +           END_JS_LINE,
                        IND_START_JS2 +         DIR_INCLUDE +           END_JS_LINE
    ],
    'include-static' : [
                        IND_START_JS1 +         DIR_INCLUDE_STATIC +    END_JS_LINE,
                        IND_START_JS2 +         DIR_INCLUDE_STATIC +    END_JS_LINE
    ],
    exclude : {
      start :           SP_START_JS +           DIR_EXCLUDE_START +     END_JS_NLS,
      end   :           SP_START_JS +           DIR_EXCLUDE_END +       END_JS_NL
    },
    extend : {
      start :           SP_START_JS +           DIR_EXTEND_START +      END_JS_NLS,
      end   :           SP_START_JS +           DIR_EXTEND_END +        END_JS_NL
    },
    extendable :        SP_START_JS +           DIR_EXTENDABLE +        END_JS_LINE,
    if : {
      start :           SP_START_JS +           DIR_IF_START +          END_JS_NLS,
      end   :           SP_START_JS +           DIR_IF_END +            END_JS_NL
    },
    foreach : {
      start :           SP_START_JS +           DIR_FOREACH_START +     END_JS_NLS,
      end   :           SP_START_JS +           DIR_FOREACH_END +       END_JS_NL
    }
  },
  coffee : {
    echo :              START_COFFEE +          DIR_ECHO +              END_COFFEE_LINE,
    exec :              START_COFFEE +          DIR_EXEC +              END_COFFEE_LINE,
    include :           IND_START_COFFEE +      DIR_INCLUDE +           END_COFFEE_LINE,
    'include-static' :  IND_START_COFFEE +      DIR_INCLUDE_STATIC +    END_COFFEE_LINE,
    exclude : {
      start :           SP_START_COFFEE +       DIR_EXCLUDE_START +     END_COFFEE_NLS,
      end   :           SP_START_COFFEE +       DIR_EXCLUDE_END +       END_COFFEE_NL
    },
    extend : {
      start :           SP_START_COFFEE +       DIR_EXTEND_START +      END_COFFEE_NLS,
      end   :           SP_START_COFFEE +       DIR_EXTEND_END +        END_COFFEE_NL
    },
    extendable :        SP_START_COFFEE +       DIR_EXTENDABLE +        END_COFFEE_LINE,
    if : {
      start :           SP_START_COFFEE +       DIR_IF_START +          END_COFFEE_NLS,
      end   :           SP_START_COFFEE +       DIR_IF_END +            END_COFFEE_NL
    },
    foreach : {
      start :           SP_START_COFFEE +       DIR_FOREACH_START +     END_COFFEE_NLS,
      end   :           SP_START_COFFEE +       DIR_FOREACH_END +       END_COFFEE_NL
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
