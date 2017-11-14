var baseUrl = 'https://distilled.pm/'
var target = 'public'

var Vinyl = require('vinyl')
var atom = require('./atom')
var autoprefixer = require('autoprefixer')
var cp = require('child_process')
var cssnano = require('cssnano')
var folders = require('gulp-folders')
var gulp = require('gulp')
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

var articles = gulp.src(globs['articles'])
var pamphlets = gulp.src(globs['pamphlets'])


/**
 * Package tasks
 */
gulp.task('default', ['routes'], function (done) {
    var cargo = cp.spawn('cargo', ['build', '--release'])
    cargo.stdout.pipe(process.stdout)
    cargo.stderr.pipe(process.stderr)
    cargo.on('close', done)
})

gulp.task('routes', ['site'], function () {
    return gulp.src(target + '/**/*')
        .pipe(rustRoutes())
        .pipe(gulp.dest('src'))
})


/**
 * Build tasks
 */
gulp.task('site', ['articles', 'feed', 'landing', 'magazines', 'style', 'assets'])

gulp.task('articles', function () {
    return articles.pipe(press()).pipe(gulp.dest(target))
})

gulp.task('feed', function () {
    feedOpts = {
        atom: true,
        path: 'feed.atom'
    }

    return pamphlets.pipe(sort({asc: false}))
        .pipe(press(feedOpts))
        .pipe(gulp.dest(target))
})

gulp.task('landing', function() {
    var landingOpts = {
        concat: true
    }

    return pamphlets.pipe(sort({asc: false}))
        .pipe(press(landingOpts))
        .pipe(gulp.dest(target))
})

gulp.task('magazines', folders('content/magazine', function (folder) {
    var issueOpts = {
        concat: true,
        path: 'distilled-magazine-' + folder + '/index.html',
        meta: {
            url: baseUrl + folder
        }
    }

    return gulp.src(path.join('content', 'magazine', folder, '**/*.md'))
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

    return gulp.src(globs['style'])
        .pipe(postcss(plugins))
        .pipe(gulp.dest(target))
})

gulp.task('assets', function() {
    return gulp.src(globs.assets).pipe(gulp.dest(target))
})


/**
 * Development tasks
 */
gulp.task('watch', ['site'], function() {
    gulp.watch(globs['articles'], ['articles'])
    gulp.watch(globs['pamphlets'], ['feed', 'landing'])
    gulp.watch(globs['magazines'], ['magazines'])
    gulp.watch(globs['elements'], ['articles', 'landing'])
    gulp.watch(globs['style'], ['style'])
    gulp.watch(globs['assets'], ['assets'])
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

        var content = opts.atom ? atom.entry(parsed) : require('./elements/article')(parsed).toString()
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

function rustRoutes (name) {
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

        cb(null, new Vinyl({
            path: name || 'routes.rs',
            contents: new Buffer(module)
        }))
    })

    function struct (route) {
        return `Route { url: "${route.url}", bytes: include_bytes!("${route.file}"), mime: "${mime.lookup(route.file)}" }`
    }
} 


/**
 * Helpers:
 */
function html (parsed, content) {
    return '<!doctype html><html>' + require('./elements/head')(parsed) + '<body>' + content /*+ require('./elements/navigation')()*/ + '</body></html>'
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
