'use strict';

module.exports = function(grunt) {
  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    clean: {
      coverage: {
        src: 'coverage'
      },
      test: {
        src: 'test/tmp'
      },
      benchmark: {
        src: 'benchmark/result.csv'
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
      }
    },
    mocha_istanbul: {
      options: {
        mask: '*.spec.js',
        root: './lib',
        check: {
          lines: 95,
          statements: 95
        }
      },
      coverage: {
        src: 'test',
        options: {
          reportFormats: ['lcov'] // html + lcov
        }
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

  grunt.registerTask('coverage', ['clean:coverage', 'mocha_istanbul:coverage']);
  grunt.registerTask('test', ['jshint', 'mochaTest:preprocess']);
  grunt.registerTask('dev', ['deps-ok', 'watch']);
  grunt.registerTask('default', ['test', 'coverage']);
  grunt.registerTask('ci', ['default', 'coveralls']);
};
