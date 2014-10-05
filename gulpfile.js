var gulp = require('gulp'),
    gutil = require('gulp-util'),
    browserify = require('gulp-browserify'),
    reactify = require('reactify'),
    react = require('gulp-react'),
    rename = require('gulp-rename'),
    connect = require('gulp-connect'),
    jest = require('gulp-jest'),
    plumber = require('gulp-plumber'),
    jshint = require('gulp-jshint'),
    server = require('gulp-express');

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
  lib: ['lib/**/*.js']
};

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

gulp.task('jest', ['jshint'], function() {
  return gulp.src('spec').pipe(jest({
    scriptPreprocessor: "preprocessor.js",
    unmockedModulePathPatterns: [
      "node_modules/react",
      "node_modules/superagent"
    ],
    testDirectoryName: "spec",
    testPathIgnorePatterns: [
      "node_modules",
      "preprocessor.js"
    ],
    moduleFileExtensions: [
      "js",
      "react"
    ]
  }));
});

gulp.task('watch', function() {
  gulp.watch(paths.js, ['build']);
  gulp.watch(paths.html, ['html']);
  gulp.watch(paths.css, ['css']);
});

gulp.task('build', ['jest', 'html', 'css', 'lib', 'fonts'], function() {
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

gulp.task('default', ['watch', 'jest', 'build', 'express']);
