var gulp = require('gulp'),
    gutil = require('gulp-util'),
    browserify = require('gulp-browserify'),
    reactify = require('reactify'),
    rename = require('gulp-rename'),
    connect = require('gulp-connect');

gulp.task('html', function() {
  gulp.src('index.html')
      .pipe(gulp.dest('build'));
});

gulp.task('build', ['html'], function() {
  // Single entry to browserify
  gulp.src('js/app.react')
      .pipe(browserify({
        insertGlobals: true,
        debug: !gulp.env.production,
        extensions: ['.react'],
        transform: [reactify]
      }))
      .pipe(rename('app.js'))
      .pipe(gulp.dest('./build'))
});

gulp.task('frontendServer', ['build'], function() {
  connect.server({
    root: 'build',
    livereload: true
  });
});

gulp.task('default', ['build', 'frontendServer']);
