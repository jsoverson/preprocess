'use strict';

module.exports = function hello() {
  var names = Array.prototype.slice.call(arguments);

  return 'Hello ' + names.join() + '!';
};