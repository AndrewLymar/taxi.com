var gulp = require('gulp'),
	gutil = require('gulp-util'),
	sass = require('gulp-sass'),
	browserSync = require('browser-sync'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	cleanCSS = require('gulp-clean-css'),
	concatCss = require('gulp-concat-css'),
	rename = require('gulp-rename'),
	del = require('del'),
	imagemin = require('gulp-imagemin'),
	cache = require('gulp-cache'),
	svgSprite = require('gulp-svg-sprite'),
	svgmin = require('gulp-svgmin'),
	cheerio = require('gulp-cheerio'),
	replace = require('gulp-replace'),
	autoprefixer = require('gulp-autoprefixer'),
	ftp = require('vinyl-ftp'),
	notify = require("gulp-notify"),
	rsync = require('gulp-rsync');

gulp.task('js', function () {
	return gulp.src([
		'app/js/jquery.min.js',
		'app/js/svguse.js',
		'app/js/mobileMenu.js',
		'app/js/slick.min.js',
		'app/js/common.js'
		])
		.pipe(concat('scripts.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('app/js'))
		.pipe(browserSync.reload({
			stream: true
		}));
});

gulp.task('browser-sync', function () {
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false,
		// tunnel: true,
		// tunnel: "projectmane", //Demonstration page: http://projectmane.localtunnel.me
	});
});

gulp.task('sass', function () {
	return gulp.src('app/scss/**/*.scss')
		.pipe(sass({
			outputStyle: 'expand'
		}).on("error", notify.onError()))
		.pipe(autoprefixer(['last 5 versions']))
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.reload({
			stream: true
		}));
});

gulp.task('css', function () {
	return gulp.src('app/css/**/*.css')
		.pipe(autoprefixer(['last 5 versions']))
		.pipe(cleanCSS())
		.pipe(concatCss("style.min.css"))
		.pipe(gulp.dest('dist/css'))
		.pipe(browserSync.reload({
			stream: true
		}));
});

gulp.task('watch', ['sass', 'js', 'browser-sync'], function () {
	gulp.watch('app/scss/**/*.scss', ['sass']);
	gulp.watch(['app/js/common.js'], ['js']);
	gulp.watch(['app/js/mobileMenu.js'], ['js']);
	gulp.watch('app/*.html', browserSync.reload);
});

gulp.task('svg', function () {
	return gulp.src('app/img/*.svg')
		.pipe(svgmin({
			js2svg: {
				pretty: true
			}
		}))
		.pipe(cheerio({
			run: function ($) {
				$('[fill]').removeAttr('fill');
				$('[stroke]').removeAttr('stroke');
				$('[style]').removeAttr('style');
			},
			parserOptions: {
				xmlMode: true
			}
		}))
		.pipe(replace('&gt;', '>'))
		.pipe(svgSprite({
			mode: {
				symbol: {
					sprite: "sprite.svg"
				}
			}
		}))
		.pipe(gulp.dest('app/img'));
});

gulp.task('imagemin', function () {
	return gulp.src('app/img/**/*')
		// .pipe(cache(imagemin())) // Cache Images
		.pipe(imagemin())
		.pipe(gulp.dest('dist/img'));
});

gulp.task('build', ['removedist', 'imagemin', 'sass', 'css', 'js'], function () {

	var buildFiles = gulp.src([
		'app/*.html',
		'app/.htaccess',
		]).pipe(gulp.dest('dist'));

	var buildJs = gulp.src([
		'app/js/scripts.min.js',
		]).pipe(gulp.dest('dist/js'));

	var buildFonts = gulp.src([
		'app/fonts/**/*',
		]).pipe(gulp.dest('dist/fonts'));

});

gulp.task('deploy', function () {

	var conn = ftp.create({
		host: 'hostname.com',
		user: 'username',
		password: 'userpassword',
		parallel: 10,
		log: gutil.log
	});

	var globs = [
	'dist/**',
	'dist/.htaccess',
	];
	return gulp.src(globs, {
			buffer: false
		})
		.pipe(conn.dest('/path/to/folder/on/server'));

});

gulp.task('rsync', function () {
	return gulp.src('dist/**')
		.pipe(rsync({
			root: 'dist/',
			hostname: 'username@yousite.com',
			destination: 'yousite/public_html/',
			// include: ['*.htaccess'],
			recursive: true,
			archive: true,
			silent: false,
			compress: true
		}));
});

gulp.task('removedist', function () {
	return del.sync('dist');
});
gulp.task('clearcache', function () {
	return cache.clearAll();
});

gulp.task('default', ['watch']);
