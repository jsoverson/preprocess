'use strict';

var spawn = require('child_process').spawn;

module.exports = {
  name: 'grunt mochaTest:preprocess',
  maxTime: 10,
  defer: true,
  fn: function(deferred) {
    var spawnGrunt = spawn(process.argv[0], [process.argv[1], 'mochaTest:preprocess']);

    spawnGrunt.stderr.on('data', function(data) {
      deferred.resolve();
      throw new Error(data);
    });

    spawnGrunt.on('exit', function() {
      deferred.resolve();
    });
  }
};