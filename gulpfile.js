var gulp = require('gulp'),
    gutil = require('gulp-util'),
    browserify = require('gulp-browserify'),
    reactify = require('reactify'),
    react = require('gulp-react'),
    rename = require('gulp-rename'),
    connect = require('gulp-connect'),
    jest = require('gulp-jest'),
    jshint = require('gulp-jshint');

gulp.task('css', function() {
  gulp.src('css/app.css')
      .pipe(gulp.dest('build/css'));
});

var paths = {
  js: ['js/**/*.react'],
  html: ['index.html'],
  css: ['css/*.css']
};

gulp.task('html', function() {
  gulp.src('index.html')
      .pipe(gulp.dest('build'));
});

gulp.task('jshint', function() {
  gulp.src('js/**/*.react')
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

gulp.task('build', ['jest', 'html', 'css'], function() {
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

gulp.task('default', ['watch', 'jest', 'build', 'frontendServer']);
