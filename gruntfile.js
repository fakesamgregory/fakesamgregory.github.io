module.exports = function(grunt) {

  require('jit-grunt')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      my_target: {
        files: {
          'dist/js/main.js': ['.tmp/js/main.js']
        }
      }
    },

    sass: {
      dev: {
        options: {
          style: 'expanded',
          sourcemap: 'none'
        },
        files: {
          'dist/css/main.css': 'components/sass/main.scss'
        }
      },
      build: {
        options: {
          style: 'compressed',
          sourcemap: 'none'
        },
        files: {
          'compiled/css/main.css': 'components/sass/main.scss'
        }
      }
    },

    autoprefixer: {
      options: {
        browsers: ['last 2 versions']
      },
      multiple_files: {
        src: 'compiled/css*/main.css',
        dest: 'dist/css/main.css'
      }
    },

    watch: {
      options: {
        livereload: true
      },
      grunfile: { files: 'gruntfile.js' },
      sass: {
        files: ['components/**/*.scss'],
        tasks: ['sass', 'autoprefixer']          
      },
      scripts: {
        files: ['components/js/**/*.js'],
        tasks: ['browserify']
      },
      assemble: {
        files: ['components/**/*.hbs', 'components/data/*.{json,yml}'],
        tasks: ['assemble']
      },
      images: {
        files: ['components/images/**/*'],
        tasks: ['copy:images']
      }
    },

    copy: {
      main: {
        files: [
          {expand: true, flatten: true, src: ['node_modules/bootstrap-sass/assets/fonts/bootstrap/**/*'], dest: 'css/fonts', filter: 'isFile'},
        ],
      },
      images: {
        expand: true,
        flatten: true,
        cwd: 'components/images/',
        src: '*.{jpg,gif,png}',
        dest: 'dist/images/'
      },
      fonts: {
        src: 'css/fonts/**/*',
        dest: 'dist/css/fonts',
        expand: true, 
        flatten: true
      },
      files : {
        src: ['*.pdf'],
        dest: 'dist/'
      }
    },

    responsive_images: {
      images: {
        options: {
          sizes: [
          {
            name: 'small',
            width: '50%',
            rename: false
          },
          {
            name: "large",
            width: '100%',
            suffix: "@x2",
            rename: false
          }]
        },
        files: [{
          expand: true,
          flatten: true,
          src: ['*.{jpg,gif,png}'],
          cwd: 'components/images/logos/',
          dest: 'dist/images/'
        }]
      }
    },

    assemble: {
      options: {
        assets: '/',
        partials: ['components/partials/**/*.hbs'],
        layoutdir: 'components/layouts',
        data: ['components/data/*.{json,yml}']
      },
      site: {
        options: {
          layout: 'master.hbs'
        },
       files: [
           {
              expand: true,
              cwd: 'components/pages/',
              src: '**/*.hbs',
              dest: 'dist/'
           }
        ]
      }
    },

    connect: {
      server: {
        options: {
          base: 'dist/',
          open: true,
          hostname: 'localhost'
        }        
      }
    },

    htmlmin: {                                     
      dist: {                                      
        options: {                                 
          removeComments: true,
          collapseWhitespace: true,
          removeTagWhitespace: true,
          removeAttributeQuotes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true
        },
        files: [
           {
              expand: true,
              cwd: 'dist/',
              src: '**/*.html',
              dest: 'dist/'
           }
        ]
      }
    },

    browserify: {
       options: {
          browserifyOptions: {
             debug: true
          }
       },
       dist: {
          files: {
             '.tmp/js/main.js': 'components/js/**/*.js'
          }
       },
       dev: {
        files: {
             'dist/js/main.js': 'components/js/**/*.js'
          }
       }
    },

    imagemin: {                          // Task
      dynamic: {                         // Another target
        files: [{
          expand: true,                  // Enable dynamic expansion
          cwd: 'dist/images/',                   // Src matches are relative to this path
          src: ['**/*.{png,jpg,gif}'],   // Actual patterns to match
          dest: 'dist/images/'                  // Destination path prefix
        }]
      }
    }
  });

  grunt.registerTask('imageloop', function() {
    var images = [];
    grunt.file.recurse('components/images/logos', function(abspath, rootdir, subdir, filename) {
      if (filename.match(/jpg|gif|png/)) {
        var ext = filename.match(/jpg|gif|png/);
        images.push(
          { 
            src: filename,
            filename: filename.replace(/.(jpg|gif|png)/, ''),
            ext: ext
           }
          );
      }
    });
    grunt.file.write('components/data/work.json', JSON.stringify(images));
  });

  grunt.registerTask('default',
    [
    'imageloop',
    'copy',
    'responsive_images',
    'browserify:dev',
    'sass:dev', 
    'assemble', 
    'connect',
    'watch'
    ]
  );

  grunt.registerTask('build', 
    [
    'imageloop',
    'copy:main', 'copy:fonts', 'copy:files',
    'imagemin', 
    'browserify:dist',
    'uglify',
    'sass:build', 
    'autoprefixer', 
    'assemble',
    'htmlmin'
    ]
  );
}