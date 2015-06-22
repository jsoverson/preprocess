'use strict';

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    mochaTest: {
      preprocess: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.spec.js']
      }
    },
    jshint: {
      options: {
        jshintrc : '.jshintrc'
      },
      lib : ['lib/**/*.js'],
      test : ['test/**/*.spec.js']
    },
    watch: {
      src: {
        options: {
          atBegin: true
        },
        files: [
          'lib/**/*.js',
          'test/**/*',
          '!test/tmp/**/*'
        ],
        tasks: ["test"]
      }
    }
  });

  grunt.registerTask('test', ['jshint', 'mochaTest']);
  grunt.registerTask('dev', ['deps-ok', 'watch']);
  grunt.registerTask('default', ['test']);
};
