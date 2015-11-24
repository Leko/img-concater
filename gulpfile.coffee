'use strict';

gulp       = require 'gulp'
sass       = require 'gulp-sass'
browserify = require 'browserify'
babelify   = require 'babelify'
source     = require 'vinyl-source-stream'

PATHS =
  SCSS: './assets/scss/**/*.scss'
  SCSS_MAIN: './assets/scss/all.scss'
  SCSS_DIST: './assets/dist/css'
  JSX: './assets/js/**/*.jsx'
  JSX_MAIN: './assets/js/app.jsx'
  JSX_DIST: './assets/dist/js'

gulp.task 'build:js', ->
  browserify(PATHS.JSX_MAIN, debug: true)
    .transform(babelify, { extensions: ['.jsx'], presets: ["es2015", "react"] })
    .bundle()
    .on('error', (err) -> console.log("Error : " + err.message))
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(PATHS.JSX_DIST))

gulp.task 'build:sass', ->
  gulp.src(PATHS.SCSS_MAIN)
    .pipe(sass(outputStyle: 'compressed').on('error', sass.logError))
    .pipe(gulp.dest(PATHS.SCSS_DIST))

gulp.task 'watch', ->
  gulp.watch PATHS.JSX, ['build:js']
  gulp.watch PATHS.SCSS, ['build:sass']

gulp.task 'default', ['watch']
