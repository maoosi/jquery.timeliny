'use strict';

var gulp = require('gulp');
var cssnano = require('gulp-cssnano');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var plumber = require('gulp-plumber');
var watch = require('gulp-watch');
var uglify = require('gulp-uglify');


gulp.task('css', function() {

	return gulp.src(['src/*.scss'])
		.pipe(watch('src/*.scss', {
			ignoreInitial: false,
			verbose: true
		}))
		.pipe(plumber())
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest('dist/'))
		.pipe(cssnano())
		.pipe(rename(function (path) {
			path.basename += '.min';
		}))
		.pipe(gulp.dest('dist/'));

});

gulp.task('js', function() {

	return gulp.src(['src/*.js'])
		.pipe(watch('src/*.js', {
			ignoreInitial: false,
			verbose: true
		}))
		.pipe(plumber())
		.pipe(gulp.dest('dist/'))
		.pipe(uglify())
		.pipe(rename(function (path) {
			path.basename += '.min';
		}))
		.pipe(gulp.dest('dist/'));

});

gulp.task('default', ['css', 'js']);
