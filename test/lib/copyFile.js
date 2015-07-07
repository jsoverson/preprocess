'use strict';

var fs = require('fs');

module.exports = function copyFile (source, dest, callback) {
  var writer = fs.createWriteStream(dest);
  fs.createReadStream(source).pipe(writer);

  writer.on('finish', callback);
};

