var target = 'www'

var autoprefixer = require('autoprefixer')
var cssnano = require('cssnano')
var folders = require('gulp-folders')
var gulp = require('gulp')
var marked = require('marked')
var path = require('path')
var postcss = require('gulp-postcss')
var through = require('through2')
var Vinyl = require('vinyl')
var yml = require('js-yaml')

var article = require('./elements/article.js')
var head = require('./elements/head')

gulp.task('default', [
    'assets',
    'magazine:articles',
    'magazine:issues',
    'styles'
])

gulp.task('magazine:articles', function () {
    return gulp.src('magazine/**/*.md')
        .pipe(press())
        .pipe(gulp.dest(target))
    
})

gulp.task('magazine:issues', folders('magazine', function (folder) {
    var meta = {
        url: 'https://distilled.pm/' + folder
    }

    return gulp.src(path.join('magazine', folder, '**/*.md'))
        .pipe(press({concat: true, path: 'magazine-' + folder + '/index.html', meta: meta}))
        .pipe(gulp.dest(target))
})) 

gulp.task('styles', function() {
  var plugins = [
    autoprefixer(),
    cssnano()
  ]

  return gulp.src('assets/style.css')
    .pipe(postcss(plugins))
    .pipe(gulp.dest(target))
})

gulp.task('assets', function() {
  return gulp.src(['assets/**', '!**/*.css']).pipe(gulp.dest(target))
})

/**
 * Plugins:
 */
function press (opts) {
    if (!opts) {
        opts = {}
    }
    var concat = ''

    return through.obj(function (post, encoding, cb) {
        var name = path.basename(post.path, '.md').split('-').slice(3).join('-')
        var parsed = jekyll(post.contents.toString(), name)
        var content = article(parsed).toString()

        if (opts.concat) {
            concat += content
            return cb()
        }
        cb(null, new Vinyl({
            path: name + '/index.html',
            contents: new Buffer(doc(parsed, content))
        }))
    }, function (cb) {
        if (concat === '') {
            return cb()
        }

        cb(null, new Vinyl({
            path: opts.path || 'index.html',
            contents: new Buffer(doc(opts.meta || {url: 'https://distilled.pm'}, concat))
        }))
    })
}

/**
 * Helpers:
 */
function doc (parsed, content) {
    return '<!doctype html><html>' + head(parsed) + '<body>' + content + '</body></html>'
}

function jekyll (txt, slug) {
    var doc, content

    if (/^---\n/.test(txt)) {
        var parts = txt.split('\n---\n')
        doc = yml.safeLoad(parts[0].replace(/^---\n/, ''))
        content = parts.slice(1).join('\n---\n').replace(/^\n/, '')
    }
    else {
        doc = {}
        content = txt
    }
    doc.content = marked(content)
    doc.url = 'https://distilled.pm/' + slug
    
    return doc
}
