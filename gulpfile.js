var gulp = require('gulp'),
    gutil = require('gulp-util'),
    browserify = require('gulp-browserify'),
    reactify = require('reactify'),
    react = require('gulp-react'),
    rename = require('gulp-rename'),
    connect = require('gulp-connect'),
    plumber = require('gulp-plumber'),
    jshint = require('gulp-jshint'),
    mocha = require('gulp-mocha'),
    server = require('gulp-express');

// Gulp setup to run mocha tests
gulp.task('backend-tests', function() {
  return gulp.src(['test/*.jsx'], { read: false })
    .pipe(react())
    .pipe(mocha({ reporter: 'spec' }))
    .on('error', gutil.log);
});

gulp.task('frontend-tests', function() {
  return gulp.src(['spec/**/*.jsx'])
             .pipe(react())
             .pipe(gulp.dest('build/spec/'))
             .pipe(mocha({ reporter: 'spec' }))
             .on('error', gutil.log);
});

gulp.task('watch-mocha', function() {
  //gulp.watch(['test/**', 'api/**'], ['backend-tests']);
  gulp.watch(['spec/**/*.jsx', 'js/**'], ['frontend-tests']);
});

gulp.task('fonts', function() {
  gulp.src('fonts/*')
      .pipe(gulp.dest('build/fonts'));
});

gulp.task('lib', function() {
  gulp.src('js/lib/**/*')
      .pipe(gulp.dest('build/js/lib'));
});

gulp.task('css', function() {
  gulp.src('css/*')
      .pipe(gulp.dest('build/css'));
});

var paths = {
  js: ['js/**/*.jsx', 'spec/**/*.js'],
  html: ['index.html'],
  css: ['css/*.css'],
  lib: ['lib/**/*.js'],
  images: ['images/**'],
};

gulp.task('images', function() {
  gulp.src('images/**')
      .pipe(gulp.dest('build/images'));
});

gulp.task('html', function() {
  gulp.src('index.html')
      .pipe(gulp.dest('build'));
});

gulp.task('jshint', function() {
  gulp.src('js/**/*.jsx')
      .pipe(plumber())
      .pipe(react())
      .pipe(jshint({ newcap: false, node: true, browser: true }))
      .pipe(jshint.reporter('default'));
});


gulp.task('watch', function() {
  gulp.watch(paths.js, ['build']);
  gulp.watch(paths.html, ['html']);
  gulp.watch(paths.css, ['css']);
  gulp.watch(paths.images, ['images']);
});

gulp.task('build', ['html', 'css', 'lib', 'fonts', 'images'], function() {
  // Single entry to browserify
  gulp.src('js/app.jsx')
      .pipe(plumber())
      .pipe(browserify({
        insertGlobals: true,
        // TODO: Switch this to another env CLI
        debug: true,
        extensions: ['.jsx'],
        transform: [reactify]
      }))
      .pipe(rename('app.js'))
      .pipe(gulp.dest('./build'))
});

gulp.task('express', ['build'], function() {
  // start the server at the beginning of the task
  server.run({
    file: 'server.js'
  });
});

gulp.task('default', ['watch', 'watch-mocha', 'build', 'express']);
