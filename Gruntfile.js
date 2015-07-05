'use strict';

module.exports = function(grunt) {
  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    clean: {
      coverage: {
        src: ['coverage']
      },
      test: {
        src: ['test/tmp']
      },
      benchmark: {
        src: ['benchmark/result.csv']
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
        src: ['test/**/*.spec.js']
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
      test : ['test/**/*.spec.js'],
      benchmark: ['benchmark/**/*.js']
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
        tasks: ['test', 'coverage']
      }
    },
    benchmark: {
      options: {
        displayResults: true
      },

      'mochaTest-preprocess': {
        src: ['benchmark/gruntMochaTestPreprocess.js'],
        dest: 'benchmark/result.csv'
      }
    }
  });

  grunt.registerTask('prepare-cov', ['clean:coverage', 'blanket', 'copy']);
  grunt.registerTask('coverage',
    ['prepare-cov', 'mochaTest:html-cov', 'mochaTest:mocha-lcov-reporter', 'mochaTest:travis-cov']);
  grunt.registerTask('test', ['jshint', 'mochaTest:preprocess']);
  grunt.registerTask('dev', ['deps-ok', 'watch']);
  grunt.registerTask('default', ['test', 'coverage']);
  grunt.registerTask('ci', ['default', 'coveralls']);
};
