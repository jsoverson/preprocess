
module.exports = {
  html : {
    echo : "<!--[ \t]*@echo[ \t]*([^\n-]*)[ \t]*-->",
    include : "<!--[ \t]*@include[ \t]*([^\n]*)[ \t]*-->",
    exclude : {
      start : "<!--[ \t]*@exclude[ \t]*([^\n]*)[ \t]*-->",
      end   : "<!--[ \t]*@endexclude[ \t]*-->"
    },
    if : {
      start : "<!--[ \t]*@if[ \t]*(.*?)(?:(?!-->))[ \t]*-->",
      end   : "<!--[ \t]*@endif[ \t]*-->"
    },
    ifdef : {
      start : "<!--[ \t]*@ifdef[ \t]*(.*?)(?:(?!-->))[ \t]*-->",
      end   : "<!--[ \t]*@endif[ \t]*-->"
    },
    ifndef : {
      start : "<!--[ \t]*@ifndef[ \t]*(.*?)(?:(?!-->))[ \t]*-->",
      end   : "<!--[ \t]*@endif[ \t]*-->"
    }
  },
  js : {
    echo : "(?://|/\\*)[ \t]*@echo[ \t]*([^\n*]*)[ \t]*(?:\\*/)?",
    include : "(?://|/\\*)[ \t]*@include[ \t]*([^\n*]*)[ \t]*(?:\\*/)?",
    exclude : {
      start : "(?://|/\\*)[ \t]*@exclude[ \t]*([^\n*]*)[ \t]*(?:\\*/)?",
      end   : "(?://|/\\*)[ \t]*@endexclude[ \t]*(?:\\*/)?"
    },
    if : {
      start : "(?://|/\\*)[ \t]*@if[ \t]*([^\n*]*)[ \t]*(?:\\*/)?",
      end   : "(?://|/\\*)[ \t]*@endif[ \t]*(?:\\*/)?"
    },
    ifdef : {
      start : "(?://|/\\*)[ \t]*@ifdef[ \t]*([^\n*]*)[ \t]*(?:\\*/)?",
      end   : "(?://|/\\*)[ \t]*@endif[ \t]*(?:\\*/)?"
    },
    ifndef : {
      start : "(?://|/\\*)[ \t]*@ifndef[ \t]*([^\n*]*)[ \t]*(?:\\*/)?",
      end   : "(?://|/\\*)[ \t]*@endif[ \t]*(?:\\*/)?"
    }
  },
  coffee : {
    echo : "(?://|/\\*)[ \t]*@echo[ \t]*([^\n*]*)[ \t]*(?:\\*/)?",
    include : "(?:#)[ \t]*@include[ \t]*([^\n*]*)[ \t]*(?:\\*/)?",
    exclude : {
      start : "(?:#)[ \t]*@exclude[ \t]*([^\n*]*)[ \t]*(?:\\*/)?",
      end   : "(?:#)[ \t]*@endexclude[ \t]*(?:\\*/)?"
    },
    if : {
      start : "(?:#)[ \t]*@if[ \t]*([^\n*]*)[ \t]*(?:\\*/)?",
      end   : "(?:#)[ \t]*@endif[ \t]*(?:\\*/)?"
    },
    ifdef : {
      start : "(?:#)[ \t]*@ifdef[ \t]*([^\n*]*)[ \t]*(?:\\*/)?",
      end   : "(?:#)[ \t]*@endif[ \t]*(?:\\*/)?"
    },
    ifndef : {
      start : "(?:#)[ \t]*@ifndef[ \t]*([^\n*]*)[ \t]*(?:\\*/)?",
      end   : "(?:#)[ \t]*@endif[ \t]*(?:\\*/)?"
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

module.exports.coffee     = module.exports.coffee;
module.exports.bash       = module.exports.coffee;
module.exports.shell      = module.exports.coffee;
module.exports.sh         = module.exports.coffee;
