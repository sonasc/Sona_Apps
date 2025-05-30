var path = require('path');
var htmlmin = require('gulp-htmlmin');
var browserSync = require('browser-sync').create();
var fs = require('fs');
var gulp    = require('gulp'),
    sass = require('gulp-sass')(require('sass')),
    rtlcss = require('gulp-rtlcss'),
    postcss = require('gulp-postcss'),
    tailwindcss = require('tailwindcss'),
    connect = require('gulp-connect'),
    pug     = require('gulp-pug'),
    plumber = require('gulp-plumber'),
    rename  = require('gulp-rename'),
    uglify  = require('gulp-uglify-es').default,
    data    = require('gulp-data'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps = require('gulp-sourcemaps'),
    pugI18n = require('gulp-i18n-pug'),
    concat = require('gulp-concat'),
    cleanCSS = require('gulp-clean-css'),
    prettyHtml = require('gulp-pretty-html'),
    ext_replace = require('gulp-ext-replace');

var api_json = './src/api.json';

function _join(dirname) {
  return path.join(__dirname, '..', 'src', dirname);
}

function reload(done) {
  browserSync.init({
    server: './',
    port: 9000
  })
  done();
}

/**
** Gulp tasks development
**/

function styles() {
  return (
    gulp.src('src/scss/styles.scss')
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 3 versions'],
      cascade: false
    }))
    .pipe(sass({outputStyle: 'expanded'}))
    .pipe(postcss([
      tailwindcss('./tailwind.config.js'),
      require('autoprefixer'),
    ]))
    .pipe(gulp.dest('assets/css'))
    .pipe(browserSync.stream({match: '**/*.css'}))
  );
}

function scripts() {
  browserSync.reload();
  return (
    gulp.src('src/js/*.js')
    .pipe(plumber())
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest('assets/js'))
    .pipe(connect.reload())
  );
}

function html() {
  return (
    gulp.src('*.html')
    .pipe(plumber())
    .pipe(connect.reload())
  );
}

function views() {
  var options = {
    i18n: {
      dest: './',
      namespace: '$t',
      localeExtension: true,
      locales: 'src/locales/en.json'
    },
    data: JSON.parse(fs.readFileSync(api_json))
  };
  return (
    gulp.src('src/pug/pages/*.pug')
    .pipe(plumber())
    .pipe(pugI18n(options))
    .pipe(prettyHtml({ indent_size: 2 }))
    .pipe(ext_replace('.html', '.en.html'))
    .pipe(gulp.dest(options.i18n.dest))
    .pipe(connect.reload())
  )
}

function views_custom() {
  var options = {
    i18n: {
      dest: 'custom-components',
      namespace: '$t',
      localeExtension: true,
      locales: 'src/locales/en.json'
    },
    data: JSON.parse(fs.readFileSync(api_json))
  };
  return (
    gulp.src('src/pug/custom/*.pug')
    .pipe(plumber())
    .pipe(pugI18n(options))
    .pipe(prettyHtml({ indent_size: 2 }))
    .pipe(ext_replace('.html', '.en.html'))
    .pipe(gulp.dest(options.i18n.dest))
    .pipe(connect.reload())
  )
}

/**
** Watch development file changes 
**/
const watchTailwind = gulp.parallel(views, styles);

function watchTask(done) {
  gulp.watch('src/scss/**/*.scss', styles);
  gulp.watch('src/js/*.js', scripts);
  gulp.watch('src/pug/**/*.pug', watchTailwind);
  gulp.watch('*.html', html).on('change', browserSync.reload);
  done();
}

function watchAssetsTask(done) {
  gulp.watch('src/scss/**/*.scss', styles);
  gulp.watch('src/js/*.js', scripts);
  done();
}

/**
** Generate multilanguage pages and RTL version for css vendors 
**/

function translate() {
  var options = {
    i18n: {
      dest: 'multilang',
      namespace: '$t',
      locales: 'src/locales/*.*',
    },
    data: JSON.parse(fs.readFileSync(api_json))
  };
  return gulp.src('src/pug/pages/*.pug')
    .pipe(pugI18n(options))
    .pipe(prettyHtml({ indent_size: 2 }))
    .pipe(gulp.dest(options.i18n.dest));
}

function langrtl() {
  var options = {
    i18n: {
      dest: 'multilang',
      namespace: '$t',
      locales: 'src/locales/ar.json',
    },
    data: JSON.parse(fs.readFileSync(api_json))
  };
  return gulp.src('src/pug/pages/*.pug')
    .pipe(pugI18n(options))
    .pipe(prettyHtml({ indent_size: 2 }))
    .pipe(gulp.dest(options.i18n.dest));
}

function rtl() {
  return gulp.src(['assets/css/vendors/materialize.css', 'node_modules/bootstrap/dist/css/bootstrap.css'])
    .pipe(rtlcss())
    .pipe(rename({ suffix: '-rtl' }))
    .pipe(gulp.dest('assets/css/rtl-vendors'));
}


/**
** Gulp tasks production to generate minified html and assets
**/

function prodHtml() {
  var srcDir = {
    root: './*.html',
    multilang: './multilang/**/*.html'
  }
  return (
    gulp.src(srcDir.multilang)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('dist'))
  )
}

function prodImg() {
  return (
    gulp.src('assets/images/**/*')
    .pipe(plumber())
    .pipe(gulp.dest('dist/assets/images'))
  );
}

function prodIcons() {
  return (
    gulp.src('assets/favicons/**/*')
    .pipe(plumber())
    .pipe(gulp.dest('dist/assets/favicons'))
  );
}

function prodCss() {
  return (
    gulp.src(['assets/css/vendors/**/*.css', 'assets/css/*.css'])
    .pipe(cleanCSS())
    .pipe(concat('glovora.min.css'))
    .pipe(gulp.dest('dist/assets/css'))
  );
}

function prodRtlCss() {
  return (
    gulp.src(['assets/css/rtl-vendors/*.css', 'assets/css/vendors/**/*.css', '!assets/css/vendors/bootstrap.css', '!assets/css/vendors/materialize.css', 'assets/css/*.css'])
    .pipe(cleanCSS())
    .pipe(concat('glovora-rtl.min.css'))
    .pipe(gulp.dest('dist/assets/css'))
  );
}

function prodJs() {
  return (
    gulp.src(['assets/js/vendors/jquery.min.js', 'assets/js/vendors/**/*.js', 'assets/js/*.js'])
    .pipe(uglify())
    .pipe(concat('glovora-bundle.min.js'))
    .pipe(gulp.dest('dist/assets/js'))
  );
}

/**
** Collect gulp main functional
**/

const watch = gulp.parallel(watchTask, reload);
const watch_assets = gulp.parallel(watchAssetsTask, reload);
const build = gulp.series(gulp.parallel(styles, scripts, html, views));
const build_custom = gulp.series(gulp.parallel(html, views_custom));
const assets = gulp.series(gulp.parallel(styles, scripts));
const translate_rtl = gulp.series(gulp.parallel(langrtl, rtl));
const prod = gulp.series(gulp.parallel(prodHtml, prodImg, prodIcons, prodCss, prodRtlCss, prodJs));

exports.reload = reload;
exports.styles = styles;
exports.scripts = scripts;
exports.html = html;
exports.views = views;
exports.assets = assets;
exports.watch = watch;
exports.build = build;
exports.build_custom = build_custom;
exports.translate = translate;
exports.translate_rtl = translate_rtl;
exports.prod = prod;
exports.watch_assets = watch_assets;
exports.default = watch;