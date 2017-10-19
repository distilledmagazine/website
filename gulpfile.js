var baseUrl = 'https://distilled.pm/'
var target = 'public'

var Vinyl = require('vinyl')
var atom = require('./atom')
var autoprefixer = require('autoprefixer')
var cssnano = require('cssnano')
var folders = require('gulp-folders')
var gulp = require('gulp')
var marked = require('marked')
var path = require('path')
var postcss = require('gulp-postcss')
var sort = require('gulp-sort')
var through = require('through2')
var variables = require('postcss-css-variables')
var yml = require('js-yaml')

var article = require('./elements/article')
var head = require('./elements/head')
var navigation = require('./elements/navigation')

gulp.task('default', [
    'articles',
    'feed',
    'landing',
    'magazines',
    'static',
    'style'
])


/**
 * Package tasks
 */
gulp.task('assets', ['default'], function () {
    return gulp.src([target + '/**/*', '!' + target + '/**/index.html'])
        .pipe(getRoutes())
        .pipe(rust('assets.rs'))
        .pipe(gulp.dest('src'))

    function getRoutes() {
        return through.obj(function (asset, _, cb) {
            if (asset.isDirectory()) {
                return cb()
            }
            cb(null, {
                url: asset.path.replace(asset.base, ''),
                file: asset.path
            })
        })
    }
})

gulp.task('pages', ['default'], function () {
    return gulp.src(target + '/**/index.html')
        .pipe(getRoutes())
        .pipe(rust('pages.rs'))
        .pipe(gulp.dest('src'))

    function getRoutes() {
        return through.obj(function (page, _, cb) {
            cb(null, {
                url: page.path.replace(page.base, '').replace(/[\/]?index.html$/, ''),
                file: page.path
            })
        })
    }
})


/**
 * Build tasks
 */
gulp.task('articles', function () {
    return gulp.src(['magazine/**/*.md', 'pamphlets/*.md'])
        .pipe(press())
        .pipe(gulp.dest(target))
})

gulp.task('feed', function () {
    feedOpts = {
        atom: true,
        path: 'feed.xml'
    }

    return gulp.src('pamphlets/*.md')
        .pipe(sort({asc: false}))
        .pipe(press(feedOpts))
        .pipe(gulp.dest(target))
})

gulp.task('landing', function() {
    var landingOpts = {
        concat: true
    }

    return gulp.src('pamphlets/*.md')
        .pipe(sort({asc: false}))
        .pipe(press(landingOpts))
        .pipe(gulp.dest(target))
})

gulp.task('magazines', folders('magazine', function (folder) {
    var issueOpts = {
        concat: true,
        path: 'distilled-magazine-' + folder + '/index.html',
        meta: {
            url: baseUrl + folder
        }
    }

    return gulp.src(path.join('magazine', folder, '**/*.md'))
        .pipe(sort(editorials(folder)))
        .pipe(press(issueOpts))
        .pipe(gulp.dest(target))
})) 

gulp.task('style', function() {
    var plugins = [
        autoprefixer(),
        variables(),
        cssnano()
    ]

    return gulp.src('assets/style.css')
        .pipe(postcss(plugins))
        .pipe(gulp.dest(target))
})

gulp.task('static', function() {
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
    var updated

    return through.obj(function (post, encoding, cb) {
        var name = path.basename(post.path, '.md').split('-').slice(3).join('-')
        var parsed = jekyll(post.contents.toString(), name)
        parsed.header = path.dirname(post.path).includes('magazine')
            ? 'Distilled Magazine'
            : 'Distilled Pamphlets'

        var content = opts.atom ? atom.entry(parsed) : article(parsed).toString()
        updated = updated || parsed.date

        if (opts.atom || opts.concat) {
            concat += content
            return cb()
        }
        cb(null, new Vinyl({
            path: name + '/index.html',
            contents: new Buffer(html(parsed, content))
        }))
    }, function (cb) {
        if (concat === '') {
            return cb()
        }

        var contents
        if (opts.atom) {
            contents = atom.feed(concat, updated)
        }
        else {
            contents = html(opts.meta || {url: baseUrl}, concat)
        }

        cb(null, new Vinyl({
            path: opts.path || 'index.html',
            contents: new Buffer(contents)
        }))
    })
}

/**
 * Helpers:
 */
function rust (name) {
    var routes = []

    return through.obj(function (route, _, cb) {
        routes.push(route)
        cb()
    }, function (cb) {
        var module = `
            #[derive(Clone, Debug, Hash, PartialEq)]
            pub struct Route {
                pub url: &'static str,
                pub file: &'static [u8]
            }

            pub static ROUTES: &[Route; ${routes.length}] = &[
                ${routes.map(struct).join(',\n')}
            ];
        `

        cb(null, new Vinyl({
            path: name,
            contents: new Buffer(module)
        }))
    })

    function struct (route) {
        return `Route { url: "${route.url}", file: include_bytes!("${route.file}") }`
    }
} 

function html (parsed, content) {
    return '<!doctype html><html>' + head(parsed) + '<body>' + content + navigation() + '</body></html>'
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
    doc.url = baseUrl + slug
    
    return doc
}

function editorials (folder) {
    var files = [
        '2012-07-22-letter-from-the-editor-in-chief.md',
        '2012-10-31-ed-individualism-vs-collectivism.md',
        '2013-03-25-the-origin-of-principles.md',
        '2013-09-03-the-art-of-the-possible.md'
    ]

    if (folder === 'extra') {
        return {asc : false}
    }

    return  {
        asc: false,
        comparator: function (a, b) {
            if (files.indexOf(path.basename(a.path)) > -1) {
                return 1
            }
            else if (files.indexOf(path.basename(b.path)) === -1) {
                return -1
            }
            return 0
        }
    }
}
