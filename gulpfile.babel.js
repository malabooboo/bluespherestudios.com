import del from 'del';
import gulp from 'gulp';
import changed from 'gulp-changed';
import data from 'gulp-data';
import fileInclude from 'gulp-file-include';
import nunjucksRender from 'gulp-nunjucks-render';
import sass from 'gulp-sass';
import util from 'gulp-util';
import watch from 'gulp-watch';
import webserver from 'gulp-webserver';

// Compiles CSS.
gulp.task('compileCss', [ 'clean' ], () => {
  return gulp.src('./dev/app.scss')
      .pipe(sass({outputStyle : 'compressed'}).on('error', sass.logError))
      .pipe(gulp.dest('./public/static'))
      .on('end', function() {
        util.log(util.colors.black.bgGreen('CSS: Compiled.'));
      });
});

// Copies all assets.
gulp.task('copyAssets', [ 'clean' ], () => {
  return gulp.src('./data/assets/**/*')
      .pipe(gulp.dest('./public/static/assets'))
      .on('end', function() {
        util.log(util.colors.black.bgGreen('Assets: Copied'));
      });
});

// Copies only new assets.
gulp.task('copyNewAssets', () => {
  return gulp.src('./data/**/*')
      .pipe(changed('./public/static/assets/'))
      .pipe(gulp.dest('./public/static/assets/'))
      .on('end', function() {
        util.log(util.colors.black.bgGreen('New Assets: Copied'));
      });
});

// Builds pages from templates.
gulp.task('buildHtml', [ 'clean' ], () => {
  return gulp.src('./dev/pages/index.html')
      .pipe(data(() => { return require('./data/work.json'); }))
      .pipe(nunjucksRender({path : [ './dev/templates' ]}))
      .pipe(gulp.dest('./dev'));
});

// Copies Html.
gulp.task('copyHtml', [ 'compileCss' ], () => {
  return gulp.src('./dev/index.html')
      .pipe(fileInclude({prefix : '@@', basepath : './public/static'}))
      .pipe(gulp.dest('./public/static'))
      .on('end', function() {
        util.log(util.colors.black.bgGreen('HTML: Compiled'));
      });
});

gulp.task('webserver', [ 'clean', 'copyAssets', 'buildHtml', 'copyHtml' ],
          () => {
            return gulp.src('./public/static').pipe(webserver({
              livereload : true,
              directoryListing : false,
              open : false,
              path : '/'
            }));
          });

gulp.task('clean', () => { return del([ './public/static/index.html' ]); });

gulp.task('default', [ 'webserver' ], () => {
  gulp.watch('./data/**/*', [ 'copyNewAssets' ]);
  gulp.watch('./dev/**/*.scss', [ 'copyHtml' ]);
  gulp.watch('./dev/index.html', [ 'copyHtml' ]);
});
