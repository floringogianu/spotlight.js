'use strict';
var gulp  = require('gulp');
var $     = require('gulp-load-plugins')();
var browserSync = require('browser-sync');

var paths = {
  public: "./public/",
  styles: {
    vendor: './node_modules/reveal.js/css/reveal.scss',
    src: './src/scss/**/*.scss',
    dest: './public/css/'
  },
  deck: {
    all: "./src/deck/**/*.jade",
    src: ['./src/deck/**/*.jade', '!./src/deck/_*/**'],
    dest: "./public/"
  },
  scripts: {
    reveal: ["./node_modules/reveal.js/js/reveal.js", 
            "./node_modules/reveal.js/plugin/**/*.js",
            "./node_modules/reveal.js/lib/js/*.js"],
    dest: "./public/"
  }
}
var onError = function (err) {  
  console.log(err);
  this.emit('end');
};
gulp.task('styles', function() {
  return gulp.src([paths.styles.vendor, paths.styles.src]).
    pipe( $.sass({errLogToConsole: true}) ).
    on('error', onError).
    pipe($.autoprefixer("last 1 version", "> 1%", "ie 8")).
    pipe($.csso()).
    pipe( gulp.dest(paths.styles.dest) ).
    pipe(browserSync.stream());
});


gulp.task('jade', function() {
  return gulp.src(paths.deck.src)
    //.pipe($.plumber())
    .pipe($.jade({
      pretty: true
      //data: o
    }))
    //.pipe( lr_inject() )
    .pipe( gulp.dest(paths.deck.dest) )
    .pipe(browserSync.stream());
});

gulp.task('copy', function() {
  gulp.src(paths.scripts.reveal, {base: './node_modules/reveal.js/'}) 
  .pipe(gulp.dest(paths.scripts.dest));
})

gulp.task('serve', ['jade', 'styles'], function () {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: paths.public
      //routes: {
        //'/bower_components': 'bower_components'
      //}
    }
  });

  // watch for changes
  gulp.watch([
    'public/*.html',
  ]).on('change', browserSync.reload);

  gulp.watch(paths.deck.all, ['jade']);
  gulp.watch(paths.styles.src, ['styles']);
});
