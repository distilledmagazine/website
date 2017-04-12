var site = 'Distilled Pamphlets'
var target = 'www'
var type = 'pamphlet'

var gulp = require('gulp')
var concat = require('gulp-concat')
var html = require('create-html')
var minimatch = require('minimatch')
var request = require('request')
var stream = require('through2')
var Vinyl = require('vinyl')

var level = require('level')
var db = level('./data')

gulp.task('default', [
  'homepage',
  'pamphlets',
  'assets'
])

gulp.task('homepage', function() {
  var layout = require('./layouts/pamphlet')
  var query = {
    gt: type,
    lt: type + '\\',
    reverse: true,
    limit: 5
  }

  return db.createKeyStream(query)
    .pipe(get(db, `${type}/**`))
    .pipe(transform(layout))
    .pipe(stringify())
    .pipe(vinylise())
    .pipe(concat('index.html'))
    .pipe(boiler(false))
    .pipe(gulp.dest(target))
})

gulp.task('pamphlets', function() {
  var layout = require('./layouts/pamphlet')
  var query = {
    gt: type,
    lt: type + '\\'
  }

  return db.createKeyStream(query)
    .pipe(get(db, `${type}/**`))
    .pipe(transform(layout))
    .pipe(stringify())
    .pipe(vinylise('/index.html'))
    .pipe(boiler(true))
    .pipe(gulp.dest(target))
})

gulp.task('assets', function() {
  return gulp.src('assets/**').pipe(gulp.dest(target))
})

gulp.task('replicate', function() {
  var api = process.env.DIST_API
  var user = process.env.DIST_USR
  var password = process.env.DIST_PWD

  return replicate(`https://${user}:${password}@${api}/`)
})

/**
 * Custom streams:
 */
function boiler (params) {
  return stream.obj(function (data, encoding, cb) {
    var file = new Vinyl(data)
    var title = params && file.params.entry.title
    var content = html({
      title: title ? title + ' · ' + site : site,
      body: data.contents.toString(),
      css: '/style.css'
    })
    file.contents = new Buffer(content)

    cb(null, file)
  })
}

function get (db, pattern) {
  return stream.obj(function (key, encoding, cb) {
    if (!pattern || minimatch(key, pattern)) {
      db.get(key, function(err, value) {
        if (err) {
          return cb(err)
        }

        cb(null, {
          key: key,
          value: value
        })
      })
    }
  })
}

function stringify () {
  return stream.obj(function (input, encoding, cb) {
    var data = Object.assign(input)
    data.value = input.value.toString()

    cb(null, data)
  })
}

function transform (fn) {
  return stream.obj(function (data, encoding, cb) {
    var value = JSON.parse(data.value)

    if (value.deleted) {
      cb()
    }
    else {
      cb(null, {
        key: data.key,
        value: fn(value),
        params: value
      })
    }
  })
}

function vinylise () {
  return stream.obj(function (data, encoding, cb) {
    var opts = {contents: new Buffer(data.value)}
    opts.path = data.params.entry.link
    opts.params = data.params

    cb(null, new Vinyl(opts))
  })
}

function inspect () {
  return stream.obj(function (data, encoding, cb) {
    console.info('ENTRY:', data.key, data.value)
    cb(null, data)
  })
}

/**
 * Data replicator:
 */
function replicate (remote) {
  request(remote, function (err, res, body) {
    if (err) {
      return console.error(err)
    }

    var docs = JSON.parse(body)

    docs.forEach(function (key) {
      request(remote + key, function (err, res, body) {
        if (err) {
          return console.error(err)
        }

        db.put(key, body, function (err) {
          if (err) {
            return console.error(err)
          }
        })
      })
    })
  })
}
