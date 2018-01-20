var VinylPress = require('vinyl-press')
var autoprefixer = require('autoprefixer')
var browserify = require('browserify')
var cssnano = require('cssnano')
var del = require('del')
var fs = require('fs')
var gulp = require('gulp')
var path = require('path')
var postcss = require('gulp-postcss')
var sortBy = require('sort-by')
var variables = require('postcss-css-variables')

var pamphlets
var target = path.join(__dirname, 'public')

/**
 * Initialize press
 */
var press = VinylPress.init({
  name: 'Distilled Pamphlets',
  baseUrl: 'https://distilled.pm',
  feedUrl: '/feed.atom',
  defaultLayout: 'elements/article',
  stylesheets: ['/style.css'],
  scripts: ['/bundle.js']
})

/**
 * Content sources
 */
var globs = {
  assets: ['assets/**', '!assets/**/*.css'],
  elements: 'elements/*.js',
  magazines: 'assets/articles/magazine/**/*.md',
  pamphlets: 'assets/articles/pamphlets/*.md',
  style: 'assets/styles/style.css'
}

var assets = function () {
  var collectOpts = {
    concat: 'pamphlets.json',
    sort: sortBy('-date')
  }
  pamphlets = gulp.src(globs['pamphlets']).pipe(press.fromFile(collectOpts))

  return gulp.src(globs['assets'])
  .pipe(gulp.dest(target))
}

var clean = function () {
  return del(target)
}

/**
 * Build tasks
 */
var articles = function () {
  return gulp.src([globs['magazines'], globs['pamphlets']])
  .pipe(press.fromFile())
  .pipe(press.toHtml())
  .pipe(gulp.dest(target))
}

var feed = function () {
  return pamphlets.pipe(press.toAtom('feed.atom'))
  .pipe(gulp.dest(target))
}

var homepage = function () {
  return pamphlets.pipe(press.toHtml('index.html'))
  .pipe(gulp.dest(target))
}

var magazine = function (issue) {
  var permalink = 'distilled-magazine-' + issue
  var collectOpts = {
    concat: permalink + '.json',
    sort: issue === 'extra' ? sortBy('-date') : editorials(),
    reverse: true
  }

  function run () {
    return gulp.src(path.join('assets/articles/magazine', issue, '**/*.md'))
    .pipe(press.fromFile(collectOpts))
    .pipe(press.toHtml(path.join(permalink, 'index.html')))
    .pipe(gulp.dest(target))
  }
  Object.defineProperty(run, 'name', {value: issue})

  return run
}

var style = function () {
  var plugins = [
    autoprefixer(),
    variables(),
    cssnano()
  ]

  return gulp.src(globs['style'])
  .pipe(postcss(plugins))
  .pipe(gulp.dest(target))
}

var js = function (done) {
  var bundle = fs.createWriteStream(path.join(target, 'bundle.js'))
  browserify('./client.js').bundle().pipe(bundle)
  bundle.on('error', done)
  bundle.on('finish', done)
}

var content = gulp.parallel(
  articles,
  feed,
  homepage,
  magazine('issue-1'),
  magazine('issue-2'),
  magazine('issue-3'),
  magazine('issue-4'),
  style,
  js
)

var build = gulp.series(assets, content)

/**
 * Development tasks
 */
var watch = function (done) {
  gulp.watch(globs['articles'], articles)
  gulp.watch(globs['pamphlets'], gulp.parallel(feed, homepage))
  gulp.watch(globs['style'], style)
  gulp.watch(globs['assets'], assets)
  gulp.watch(globs['elements'], gulp.parallel(articles, homepage))
}

/**
 * Expose tasks
 */
gulp.task('default', build)
gulp.task('build', gulp.series(clean, build))
gulp.task('watch', gulp.series(build, watch))

/**
 * Helpers:
 */
function editorials () {
  var files = [
    'letter-from-the-editor-in-chief',
    'ed-individualism-vs-collectivism',
    'the-origin-of-principles',
    'the-art-of-the-possible'
  ]

  return function (a, b) {
    if (files.indexOf(path.basename(a.permalink)) > -1) {
      return 1
    } else if (files.indexOf(path.basename(b.permalink)) === -1) {
      return -1
    }
    return 0
  }
}
