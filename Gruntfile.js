'use strict';

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    clean: {
      coverage: {
        src: ['coverage']
      }
    },
    copy: {
      coverage: {
        expand: true,
        src: ['test/**'],
        dest: 'coverage/'
      }
    },
    blanket: {
      coverage: {
        src: ['lib'],
        dest: 'coverage/lib'
      }
    },
    mochaTest: {
      preprocess: {
        options: {
          reporter: 'spec'
        },
        src: ['coverage/test/**/*.spec.js']
      },
      'html-cov': {
        options: {
          reporter: 'html-cov',
          quiet: true,
          captureFile: 'coverage/coverage.html'
        },
        src: ['coverage/test/**/*.spec.js']
      },
      'mocha-lcov-reporter': {
        options: {
          reporter: 'mocha-lcov-reporter',
          quiet: true,
          captureFile: 'coverage/lcov.info'
        },
        src: ['coverage/test/**/*.spec.js']
      },
      'travis-cov': {
        options: {
          reporter: 'travis-cov'
        },
        src: ['coverage/test/**/*.spec.js']
      }
    },
    coveralls: {
      options: {
        force: true
      },
      all: {
        src: 'coverage/lcov.info'
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

  grunt.registerTask('prepare-cov', ['clean', 'blanket', 'copy']);
  grunt.registerTask('test', ['jshint', 'prepare-cov', 'mochaTest']);
  grunt.registerTask('dev', ['deps-ok', 'watch']);
  grunt.registerTask('default', ['test']);
  grunt.registerTask('ci', ['default', 'coveralls']);
};
