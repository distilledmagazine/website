var articles, pamphlets
var baseUrl = 'https://distilled.pm/'
var target = 'public'

var Vinyl = require('vinyl')
var atom = require('./atom')
var autoprefixer = require('autoprefixer')
var changed = require('gulp-changed')
var cp = require('child_process')
var cssnano = require('cssnano')
var del =  require('del')
var folders = require('gulp-folders')
var gulp = require('gulp')
var gutil = require('gulp-util')
var live = require('live-server')
var marked = require('marked')
var mime = require('mime-types')
var path = require('path')
var postcss = require('gulp-postcss')
var sort = require('gulp-sort')
var through = require('through2')
var variables = require('postcss-css-variables')
var yml = require('js-yaml')


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

gulp.task('prepare', function() {
    articles = gulp.src(globs['articles'])
        .pipe(changed(target))
        .pipe(jekyllPostToJson())

    pamphlets = gulp.src(globs['pamphlets'])
        .pipe(changed(target))
        .pipe(sort({asc: false}))
        .pipe(jekyllPostToJson())
        .pipe(collectJsonPosts())
})

gulp.task('clean', function () {
    return del(target)
})


/**
 * Build tasks
 */
gulp.task('site', [
    'articles',
    'assets',
    'feed',
    'landing',
    'magazines',
    'style'
])

gulp.task('articles', ['prepare'], function () {
    return articles.pipe(jsonPostsToPage())
        .pipe(gulp.dest(target))
})

gulp.task('assets', function() {
    return gulp.src(globs['assets'])
        .pipe(changed(target))
        .pipe(gulp.dest(target))
})

gulp.task('feed', ['prepare'], function () {
    return pamphlets.pipe(jsonPostsToFeed('feed.atom'))
        .pipe(gulp.dest(target))
})

gulp.task('landing', ['prepare'], function() {
    return pamphlets.pipe(jsonPostsToPage('index.html'))
        .pipe(gulp.dest(target))
})

gulp.task('magazines', folders('content/magazine', function (folder) {
    return gulp.src(path.join('content', 'magazine', folder, '**/*.md'))
        .pipe(changed(target))
        .pipe(sort(editorials(folder)))
        .pipe(jekyllPostToJson())
        .pipe(collectJsonPosts('distilled-magazine-' + folder + '.json'))
        .pipe(jsonPostsToPage(false, {url: baseUrl + folder}))
        .pipe(gulp.dest(target))
})) 

gulp.task('style', function() {
    var plugins = [
        autoprefixer(),
        variables(),
        cssnano()
    ]

    return gulp.src(globs['style'])
        .pipe(changed(target))
        .pipe(postcss(plugins))
        .pipe(gulp.dest(target))
})


/**
 * Development tasks
 */
gulp.task('watch', ['site'], function() {
    gulp.watch(globs['articles'], ['articles'])
    gulp.watch(globs['pamphlets'], ['feed', 'landing'])
    gulp.watch(globs['magazines'], ['magazines'])
    gulp.watch(globs['style'], ['style'])
    gulp.watch(globs['assets'], ['assets'])

    gulp.watch(globs['elements'], ['articles', 'landing', 'magazines']).on('change', function(change) {
        delete require.cache[change.path]
    })
})

gulp.task('serve', ['watch'], function() {
    live.start({
        port: 1789,
        root: './public',
        open: false,
        logLevel: 2
    })
})


/**
 * Package tasks
 */
gulp.task('routes', ['site'], function () {
    return gulp.src(target + '/**/*')
        .pipe(staticFilesToRust())
        .pipe(gulp.dest('server'))
})

gulp.task('default', ['routes'], function (done) {
    var cargo = cp.spawn('cargo', ['build', '--release'])
    cargo.stdout.pipe(process.stdout)
    cargo.stderr.pipe(process.stderr)
    cargo.on('close', done)
})


/**
 * Plugins:
 */
function jekyllPostToJson (opts) {
    if (!opts) {
        opts = {}
    }

    return through.obj(function (doc, encoding, cb) {
        var post, content
        var slug = path.basename(doc.path, '.md').split('-').slice(3).join('-')
        var txt = doc.contents.toString()

        if (/^---\n/.test(txt)) {
            var parts = txt.split('\n---\n')
            post = yml.safeLoad(parts[0].replace(/^---\n/, ''))
            content = parts.slice(1).join('\n---\n').replace(/^\n/, '')
        } else {
            post = {}
            content = txt
        }
        post.content = marked(content)
        post.header = path.dirname(doc.path).includes('magazine') ? 'Distilled Magazine' : 'Distilled Pamphlets'
        post.slug = '/' + slug
        post.url = baseUrl + slug

        cb(null, vinyl(slug + '.json', JSON.stringify(post, opts.replacer, opts.space)))
    })
}

function collectJsonPosts (filename) {
    var array = '['

    return through.obj(function (doc, encoding, cb) {
        array += doc.contents.toString()
        array += ','
        cb()
    }, function (cb) {
        filename = filename || 'posts.json'
        array = array.replace(/\,$/, '') + ']'
        cb(null, vinyl(filename, array))
    })
}

function jsonPostsToPage (filename, data) {
    return through.obj(function (doc, encoding, cb) {
        var content, file
        var posts = JSON.parse(doc.contents.toString())
        var layout = require('./elements/article')

        if (Array.isArray(posts)) {
            data = data || {url: baseUrl}
            content = posts.map(layout).join('\n')
        } else {
            data = posts
            content = layout(data)
        }
        file = filename || doc.path.replace(/\.json$/, '/index.html')
        cb(null, vinyl(file, wrap(data, content)))
    })

    function wrap (data, content) {
        return '<!doctype html><html>' + require('./elements/head')(data) + '<body>' + content + '</body></html>'
    }
}

function jsonPostsToFeed (filename) {
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

function staticFilesToRust (filename) {
    var routes = []

    return through.obj(function (entry, _, cb) {
        if (entry.isDirectory()) {
            return cb()
        }
        routes.push({
            url: entry.path.replace(entry.base, '').replace(/[\/]?index.html$/, ''),
            file: entry.path
        })
        cb()
    }, function (cb) {
        var module = `
            #[derive(Clone, Debug, Hash, PartialEq)]
            pub struct Route {
                pub url: &'static str,
                pub bytes: &'static [u8],
                pub mime: &'static str
            }

            pub static ROUTES: &[Route; ${routes.length}] = &[
                ${routes.map(struct).join(',\n')}
            ];
        `

        filename = filename || 'routes.rs',
        cb(null, vinyl(filename, module))
    })

    function struct (route) {
        return `Route { url: "${route.url}", bytes: include_bytes!("${route.file}"), mime: "${mime.lookup(route.file)}" }`
    }
} 


/**
 * Helpers:
 */
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

function vinyl (path, contents) {
    if (verbose()) {
        gutil.log('Creaming', path)
    }
    return new Vinyl({
        path: path,
        contents: new Buffer(contents)
    })
}

function verbose () {
    return process.argv.indexOf('--verbose') !== -1
}
