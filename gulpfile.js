'use strict';

var gulp = require('gulp'),
sass = require('gulp-sass'),
autoprefixer = require('gulp-autoprefixer'),
notify = require("gulp-notify"),
plumber = require('gulp-plumber'),
wrap = require('gulp-wrap'),
concat = require('gulp-concat'),
declare = require('gulp-declare'),
handlebars = require('gulp-handlebars'),
runSeq = require('run-sequence');

/*gulp.task('express', function() {
	var express = require('express');
	var app = express();
	app.use(require('connect-livereload')({port: 4002}));
	app.use(express.static(__dirname + '/dist'));
	app.get('/*', function(req, res) {
		console.log(req.params);
	})
	app.listen(4000);
});*/

var tinylr;

gulp.task('livereload', function() {
	tinylr = require('tiny-lr')();
	tinylr.listen(4002);
});

function notifyLiveReload(event) {
	var fileName = require('path').relative(__dirname + '/dist', event.path);

	tinylr.changed({
		body: {
			files: [fileName]
		}
	});
}

gulp.task('html', function(){
	return gulp.src('views/*.html')
	.pipe(gulp.dest('dist'));
});

gulp.task('sass', function() {

	var onError = function(err) {
		notify.onError({
			title:    "Gulp",
			subtitle: "Error!",
			message:  "<%= error.message %>",
			sound:    "Beep"
		})(err);

		this.emit('end');
	};

	return gulp.src('assets/sass/*.scss')
	.pipe(plumber({errorHandler: onError}))
	.pipe(sass({ style: 'expanded' }))
	.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 9', 'opera 12.1'))
	.pipe(gulp.dest('dist/assets/css'));
});

gulp.task('js', function() {
	return gulp.src(['assets/js/*.js', 'assets/js/*/**'])
	.pipe(gulp.dest('dist/assets/js'));
});

gulp.task('assets', function(){
	return gulp.src('assets/static/*/**')
	.pipe(gulp.dest('dist/assets/static'));
});

gulp.task('templates', function () {
    return gulp.src('assets/templates/*.hbs')
      .pipe(handlebars())
      .pipe(wrap('Handlebars.template(<%= contents %>)'))
      .pipe(declare({
            namespace: 'Marmelad.templates',
            noRedeclare: true, // Avoid duplicate declarations
       }))
      .pipe(concat('templates.js'))
      .pipe(gulp.dest('assets/js/'));
});


gulp.task('watch', function() {
	gulp.watch('assets/sass/*.scss', ['sass']);
	gulp.watch('assets/js/*.js', ['js']);
	gulp.watch('assets/templates/*.hbs', ['templates']);
	gulp.watch('views/*.html', ['html']);
	gulp.watch('dist/*.html', notifyLiveReload);
	gulp.watch('dist/assets/css/*.css', notifyLiveReload);
	gulp.watch('dist/assets/js/*.js', notifyLiveReload);

});

gulp.task('default', ['sass', 'js', 'livereload', 'assets', 'templates', 'watch', 'html'], function() {

});


gulp.task('heroku:production', function(){
	runSeq('sass', 'js', 'assets', 'templates', 'html');
});
