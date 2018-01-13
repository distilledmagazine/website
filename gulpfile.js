var Vinyl = require('vinyl')
var atom = require('./atom')
var autoprefixer = require('autoprefixer')
var browserify = require('browserify')
var cssnano = require('cssnano')
var del =  require('del')
var fs = require('fs')
var gulp = require('gulp')
var gutil = require('gulp-util')
var live = require('live-server')
var marked = require('marked')
var path = require('path')
var pbox = require('pbox')
var postcss = require('gulp-postcss')
var sortBy = require('sort-by')
var through = require('through2')
var variables = require('postcss-css-variables')

var all, pamphlets
var baseUrl = 'https://distilled.pm/'
var target = path.join(__dirname, 'public')


/**
 * Content sources
 */
var globs = {
    articles: ['content/magazine/**/*.md', 'content/pamphlets/*.md'],
    assets: ['assets/**', '!assets/**/*.css'],
    elements: 'elements/*.js',
    magazines: 'content/magazine/**/*.md',
    pamphlets: 'content/pamphlets/*.md',
    style: 'assets/style.css'
}

var assets = function () {
    var collectOpts = {
        concat: 'pamphlets.json',
        sort: sortBy('-date')
    }
    pamphlets = gulp.src(globs['pamphlets']).pipe(pboxToJson(collectOpts))

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
    return gulp.src(globs['articles'])
        .pipe(pboxToJson())
        .pipe(jsonToPage())
        .pipe(gulp.dest(target))
}

var feed = function () {
    return pamphlets.pipe(jsonToFeed('feed.atom'))
        .pipe(gulp.dest(target))
}

var homepage = function () {
    return pamphlets.pipe(jsonToPage('index.html'))
        .pipe(gulp.dest(target))
}

var magazine = function (issue) {
    var collectOpts = {
        concat: 'distilled-magazine-' + issue + '.json',
        sort: issue === 'extra' ? sortBy('-date') : editorials(),
        reverse: true
    }

    function run () {
        return gulp.src(path.join('content', 'magazine', issue, '**/*.md'))
            .pipe(pboxToJson(collectOpts))
            .pipe(jsonToPage(false, {url: baseUrl + issue}))
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

    gulp.watch(globs['elements'], gulp.parallel(articles, homepage)).on('change', function(change) {
        delete require.cache[change.path]
    })

    done()
}

var serve = function () {
    live.start({
        port: 1789,
        root: './public',
        open: false,
        logLevel: 2
    })
}


/**
 * Expose tasks
 */
gulp.task('default', build)
gulp.task('build', gulp.series(clean, build))
gulp.task('serve', gulp.series(build, watch, serve))


/**
 * Plugins:
 */
function pboxToJson (opts) {
    if (!opts) {
        opts = {}
    }
    var collected = []
    var slugify = doc => '/' + path.basename(doc.path, '.md').split('-').slice(3).join('-')
    var stringify = (data) => JSON.stringify(data, opts.replacer, opts.space)

    return through.obj(function (doc, encoding, cb) {
        var props = {
            content: content => marked(content.join('\n---\n')),
            date: date => new Date(date),
            header: () => path.dirname(doc.path).includes('magazine') ? 'Distilled Magazine' : 'Distilled Pamphlets',
            slug: () => slugify(doc),
            url: () => baseUrl + slugify(doc)
        }

        var filename = path.basename(doc.path.replace(/\.md$/, '.json'))
        var parsed = pbox.parse(doc.contents.toString(), {props})

        if (!opts.concat && !opts.sort) {
            return cb(null, vinyl(doc.path, stringify(parsed)))
        }
        collected = collected.concat(parsed)
        cb()
    }, function (cb) {
        if (!collected.length) {
            return cb()
        }
        if (opts.sort) {
            collected.sort(opts.sort)
        }
        if (opts.reverse) {
            collected.reverse()
        }
        cb(null, vinyl(opts.concat, stringify(collected)))
    })
}

function jsonToPage (filename, data) {
    return through.obj(function (doc, encoding, cb) {
        var content, file
        var posts = JSON.parse(doc.contents.toString())
        var layout = require('./elements/article')

        if (posts.length > 1) {
            data = data || {url: baseUrl}
            content = posts.map(layout).join('\n')
        } else {
            data = posts[0]
            content = layout(data)
        }
        file = filename || path.join(data.slug ? slugToFile(data.slug) : fileToHtml(doc.path), 'index.html')
        cb(null, vinyl(file, wrap(data, content)))
    })

    function wrap (data, content) {
        return '<!doctype html><html>' + require('./elements/head')(data) + '<body>' + content + '</body></html>'
    }
}

function jsonToFeed (filename) {
    return through.obj(function (doc, encoding, cb) {
        var content, updated
        var posts = JSON.parse(doc.contents.toString())

        if (Array.isArray(posts)) {
            updated = posts[0].date
            content = posts.map(atom.entry).join('\n')
        } else {
            throw 'Atom feed can only be generated from a collection'
        }
        filename = filename || doc.path.replace(/\.json$/, '.atom')
        cb(null, vinyl(filename, atom.feed(content, updated)))
    })
}


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
        if (files.indexOf(path.basename(a.slug)) > -1) {
            return 1
        }
        else if (files.indexOf(path.basename(b.slug)) === -1) {
            return -1
        }
        return 0
    }
}

function slugToFile (slug) {
    return slug.replace(/^\//, '')
}

function fileToHtml (file) {
    return path.basename(file, path.extname(file))
}

function vinyl (path, contents) {
    if (verbose()) {
        gutil.log('Creating', path)
    }
    return new Vinyl({
        path: path,
        contents: new Buffer(contents)
    })
}

function verbose () {
    return process.argv.indexOf('--verbose') !== -1
}
