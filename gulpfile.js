var gulp = require('gulp'),
    gutil = require('gulp-util'),
    browserify = require('gulp-browserify'),
    reactify = require('reactify'),
    react = require('gulp-react'),
    rename = require('gulp-rename'),
    connect = require('gulp-connect'),
    jest = require('gulp-jest'),
    plumber = require('gulp-plumber'),
    jshint = require('gulp-jshint');

gulp.task('fonts', function() {
  gulp.src('fonts/*')
      .pipe(gulp.dest('build/fonts'));
});

gulp.task('bootstrapjs', function() {
  gulp.src('bootstrapjs/*')
      .pipe(gulp.dest('build/bootstrapjs'));
});

gulp.task('css', function() {
  gulp.src('css/*')
      .pipe(gulp.dest('build/css'));
});

var paths = {
  js: ['js/**/*.jsx'],
  html: ['index.html'],
  css: ['css/*.css'],
  bootstrapjs: ['bootstrapjs/*.js']
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
      "node_modules/react"
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

gulp.task('build', ['jest', 'html', 'css', 'bootstrapjs', 'fonts'], function() {
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
      .on('error', gutil.log)
      .pipe(rename('app.js'))
      .pipe(gulp.dest('./build'))
});

gulp.task('frontendServer', ['build'], function() {
  connect.server({
    root: 'build',
    livereload: true
  });
});

gulp.task('default', ['watch', 'jest', 'build', 'frontendServer']);
