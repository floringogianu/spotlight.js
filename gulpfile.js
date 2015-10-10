'use strict';
var gulp        = require('gulp');
var $           = require('gulp-load-plugins')();
var pngquant    = require('imagemin-pngquant');
var optipng     = require('imagemin-optipng');
var jpegoptim   = require('imagemin-jpegoptim');
var svgo        = require('imagemin-svgo');
var browserSync = require('browser-sync');
var fs          = require("fs");

// If the deck is clean, use the examples
var deck_folder = "./src/deck";
if (!fs.existsSync(deck_folder)) {
    deck_folder = "./src/deck-examples"
}

var paths = {
  public: "./public/",
  styles: {
    vendor: './node_modules/reveal.js/css/reveal.scss',
    src: './src/scss/**/*.scss',
    dest: './public/css/'
  },
  deck: {
    all: deck_folder.concat("/**/*.jade"),
    src: [deck_folder.concat("/**/*.jade"),
	  "!".concat(deck_folder.concat("/_*/**"))],
    dest: "./public/"
  },
  scripts: {
    reveal: ["./node_modules/reveal.js/js/reveal.js", 
            "./node_modules/reveal.js/plugin/**/*.js",
            "./node_modules/reveal.js/lib/js/*.js"],
    dest: "./public/"
  },
  img: {
    src: "./src/img/**/*{png,jpg,jpeg,svg}",
    dest: "./public/img/"
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

gulp.task('img', function() {
  gulp.src(paths.img.src).
    pipe(pngquant({quality: '65-80', speed: 4})()).
    pipe(optipng({optimizationLevel: 3})()).
    pipe(jpegoptim({max: 85, progressive: true})()).
    pipe(svgo()()).
    pipe( gulp.dest(paths.img.dest)).
    pipe(browserSync.stream());
});

gulp.task('copy', function() {
  gulp.src(paths.scripts.reveal, {base: './node_modules/reveal.js/'}) 
  .pipe(gulp.dest(paths.scripts.dest));
})

gulp.task('serve', ['jade', 'styles', 'img'], function () {
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
  gulp.watch(paths.img.src, ['img']);
});
