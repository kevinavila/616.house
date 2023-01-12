const { src, dest, watch, series, parallel } = require('gulp')

const concat     = require('gulp-concat')
const uglify     = require('gulp-uglify')
const htmlmin    = require('gulp-htmlmin')
const sass       = require('gulp-sass')(require('sass'))
const imagemin   = require('gulp-imagemin')
const sourcemaps = require('gulp-sourcemaps')
const connect    = require('gulp-connect')
const handlebars = require('gulp-handlebars')
const wrap       = require('gulp-wrap')
const declare    = require('gulp-declare')
const cache      = require('gulp-cache')
const del        = require('del')
const path       = require('path')
const merge      = require('merge-stream')

// Tasks 
function connectDev(cb) {
  connect.server({
    root: 'dist',
    port: 8001,
    livereload: true
  })
  cb()
}

function watchFiles(cb) {
  watch('app/scss/*.scss', scss)
  watch('app/*.html', html)
  watch('app/templates/*.handlebars', templates)
  watch('app/js/*.js', js)
  cb()
}

function js(cb) {
  src('app/js/*.js')
    .pipe(sourcemaps.init())
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(dest('dist/js'))
    .pipe(connect.reload())
  cb()
}

function scss(cb) {
  src('app/scss/*.scss')
    .pipe(sourcemaps.init())
    .pipe(concat('style.css'))
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(dest('dist/css'))
  cb()
}

function images(cb) {
  src('app/img/**/*.+(png|jpg|gif|svg)')
    .pipe(cache(imagemin()))
    .pipe(dest('dist/img'))
  cb()
}

function videos(cb) {
  src('app/img/*.+(mp4)')
    .pipe(dest('dist/img'))
  cb()
}

function html(cb) {
  src(['app/**/*.html'])
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(dest('dist'))
    .pipe(connect.reload())
  cb()
}

function templates(cb) {
  let partials = src('app/templates/partials/*.handlebars')
    .pipe(handlebars())
    .pipe(wrap('Handlebars.registerPartial(<%= processPartialName(file.relative) %>, Handlebars.template(<%= contents %>));', {}, {
      imports: {
        processPartialName: function(fileName) {
          // Strip the extension and the underscore
          // Escape the output with JSON.stringify
          return JSON.stringify(path.basename(fileName, '.js').substr(1));
        }
      }
    }))


  let templates = src('app/templates/*.handlebars')
    .pipe(handlebars())
    .pipe(wrap('Handlebars.template(<%= contents %>)'))
    .pipe(declare({
      namespace: 'house.templates',
      noRedeclare: true, // Avoid duplicate declarations
    }))


  merge(partials, templates)
    .pipe(concat('templates.js'))
    .pipe(dest('dist/js'))
    .pipe(connect.reload())
  cb()
}

function cleanDist(cb) {
  del.sync('dist')
  cb()
}

// Build Sequences
exports.default = series(cleanDist, html, templates, scss, images, videos, js, connectDev, watchFiles)
exports.build = series(cleanDist, html, templates, scss, images, videos, js)