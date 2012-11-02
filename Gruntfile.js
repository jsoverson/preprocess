'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    test: {
      files: ['test/**/*_test.js']
    },
    lint: {
      files: ['Gruntfile.js', 'tasks/**/*.js', '<config:test.files>']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'default'
    },
    preprocess : {
      html : {
        src : 'test/test.html',
        dest : 'test/test.processed.html'
      },
      js : {
        src : 'test/test.js',
        dest : 'test/test.processed.js'
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true,
        es5: true
      },
      globals: {}
    }
  });

  // Default task.
  grunt.registerTask('default', 'test');

};
