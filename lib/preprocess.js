/*
 * preprocess
 * https://github.com/onehealth/preprocess
 *
 * Copyright (c) 2012 OneHealth Solutions, Inc.
 * Written by Jarrod Overson - http://jarrodoverson.com/
 * Licensed under the Apache 2.0 license.
 */

/*jshint node:true*/

'use strict';

exports.preprocess         = preprocess;
exports.preprocessFile     = preprocessFile;
exports.preprocessFileSync = preprocessFileSync;

var path  = require('path'),
    fs    = require('fs'),
    delim = require('./regexrules');

function preprocessFile(src, dest, context, callback) {
  context.src = src;
  context.srcDir = path.dirname(src);

  fs.readFile(src,function(err,data){
    if (err) return callback(err,data);
    var parsed = preprocess(data, context, getExtension(src));
    fs.writeFile(dest,parsed,callback);
  });
}

function preprocessFileSync(src, dest, context) {
  context.src = src;
  context.srcDir = path.dirname(src);

  var data = fs.readFileSync(src);
  var parsed = preprocess(data, context, getExtension(src));
  return fs.writeFileSync(dest,parsed);
}


function getExtension(filename) {
  var ext = path.extname(filename||'').split('.');
  return ext[ext.length - 1];
}

function preprocess(src,context,type) {
  src = src.toString();
  context = context || process.env;
  context = getFlattedContext(context);

  if (typeof delim[type] === 'undefined'){
    type = 'html';
  }

  var rv = src;

  rv = runAllRegex(rv, getRegex(type,'include'),processIncludeDirective.bind(null,false,context,type));

  if (delim[type].extend) {
    rv = runAllRegex(rv, getRegex(type, 'extend'), function(match, file, include, line) {
      file = (file || '').trim();
      var extendedContext = shallowCopy(context);
      extendedContext.src = path.join(context.srcDir, file);
      extendedContext.srcDir = path.dirname(extendedContext.src);
      if (!fs.existsSync(extendedContext.src)) {
        return extendedContext.src + ' not found';
      }
      var extendedSource = fs.readFileSync(extendedContext.src);
      extendedSource = preprocess(extendedSource, extendedContext, type).trim();
      if (extendedSource) {
        include = include.replace(/^[\r\n]?/, '').replace(/[\r\n]?$/, '');
        return extendedSource.replace(getRegex(type, 'extendable'), include);
      } else {
        return '';
      }
    });
  }

  if (delim[type].foreach) {
    rv = runAllRegex(rv, getRegex(type, 'foreach'), function(match, variable, include) {
      variable = (variable || '').trim();
      var forParams = variable.split(' ');
      if (forParams.length === 3) {
        var contextVar = forParams[2];
        var arrString = context[contextVar];
        var eachArr;
        if (arrString.match(/\{(.*)\}/)) {
          eachArr = JSON.parse(arrString);
        } else if (arrString.match(/\[(.*)\]/)) {
          eachArr = arrString.slice(1, -1);
          eachArr = eachArr.split(',');
          eachArr = eachArr.map(function(arrEntry){
            return arrEntry.replace(/\s*(['"])(.*)\1\s*/, '$2');
          });
        } else {
          eachArr = arrString.split(',');
        }
        var stringBuilder = '';
        for (var i in eachArr) {
          stringBuilder += include.replace(forParams[0], eachArr[i]);
        }
        return stringBuilder;
      } else {
        return '';
      }
    });
  }

  if (delim[type].exclude) {
    rv = runAllRegex(rv, getRegex(type,'exclude'),function(match,test,include){
      return testPasses(test,context) ? '' : include;
    });
  }

  if (delim[type].ifdef) {
    rv = runAllRegex(rv, getRegex(type,'ifdef'),function(match,test,include){
      test = (test || '').trim();
      return typeof context[test] !== 'undefined' ? include : '';
    });
  }

  if (delim[type].ifndef) {
    rv = runAllRegex(rv, getRegex(type,'ifndef'),function(match,test,include){
      test = (test || '').trim();
      return typeof context[test] === 'undefined' ? include : '';
    });
  }

  if (delim[type].if) {
    rv = runAllRegex(rv, getRegex(type,'if'),function(match,test,include){
      return testPasses(test,context) ? include : '';
    });
  }

  rv = runAllRegex(rv, getRegex(type,'echo'),function(match,variable) {
    variable = (variable || '').trim();
    // if we are surrounded by quotes, echo as a string
    var stringMatch = variable.match(/^(['"])(.*)\1$/);
    if (stringMatch) return stringMatch[2];

    return context[(variable || '').trim()];
  });

  rv = runAllRegex(rv, getRegex(type,'exec'),function(match,name,value) {
    name = (name || '').trim();
    value = value || '';

    var params = value.split(',');
    var stringRegex = /^['"](.*)['"]$/;

    params = params.map(function(param){
      param = param.trim();
      if (stringRegex.test(param)) { // handle string parameter
        return param.replace(stringRegex, '$1');
      } else { // handle variable parameter
        return context[param];
      }
    });

    if (!context[name] || typeof context[name] !== 'function') return '';

    return context[name].apply(context, params);
  });

  rv = runAllRegex(rv, getRegex(type,'include-static'),processIncludeDirective.bind(null,true,context,type));

  return rv;
}

function runAllRegex(rv, ruleRegex, processor) {
  if (!Array.isArray(ruleRegex)) {
    ruleRegex = [ruleRegex];
  }

  ruleRegex.forEach(function(rule){
    rv = rv.replace(rule, processor);
  });

  return rv;
}

function getRegex(type, def) {
  var rule = delim[type][def];

  var isRegex = typeof rule === 'string' || rule instanceof RegExp;
  var isArray = Array.isArray(rule);

  if (isRegex) {
    rule = new RegExp(rule,'gmi');
  } else if (isArray) {
    rule = rule.map(function(subRule){
      return new RegExp(subRule,'gmi');
    });
  } else {
    rule = new RegExp(rule.start + '((?:.|\n|\r)*?)' + rule.end,'gmi');
  }

  return rule;
}

function processIncludeDirective(isStatic,context,type,match,line,file){
  file = (file || '').trim();
  var indent = line.replace(/\S/g, ' ');
  var includedContext = shallowCopy(context);
  includedContext.src = path.join(context.srcDir,file);
  includedContext.srcDir = path.dirname(includedContext.src);
  if (!fs.existsSync(includedContext.src)) {
    return includedContext.src + ' not found';
  }
  var includedSource = fs.readFileSync(includedContext.src);
  if (isStatic) {
    includedSource = includedSource.toString();
  } else {
    includedSource = preprocess(includedSource, includedContext, type);
  }
  includedSource = includedSource.replace(/\r?\n/g, '\n' + indent);
  if(includedSource) {
    return line + includedSource;
  } else {
    return "";
  }
}

function getTestTemplate(test) {
  /*jshint evil:true*/
  test = test || 'true';
  test = test.trim();

  // force single equals replacement
  test = test.replace(/([^=!])=([^=])/g, '$1==$2');

  return new Function("context", "with (context||{}){ return ( " + test + " ); }");
}

function testPasses(test,context) {
  var testFn = getTestTemplate(test);
  return testFn(context);
}

function getFlattedContext(context) {
  var toReturn = {};
  for (var i in context) {
    if (!context.hasOwnProperty(i)) continue;

    toReturn[i] = context[i];
    if ((typeof context[i]) === 'object') {
      var flatObject = getFlattedContext(context[i]);
      for (var x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue;

        toReturn[i + '.' + x] = flatObject[x];
      }
    }
  }
  return toReturn;
}

function shallowCopy(obj) {
  var copy = {};

  Object.keys(obj).forEach(function (objKey){
    copy[objKey] = obj[objKey];
  });

  return copy;
}
