var site = 'Distilled Pamphlets'
var target = 'www'
var type = 'pamphlet'

var gulp = require('gulp')
var html = require('create-html')
var minimatch = require('minimatch')
var path = require('path')
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
    reverse: true
  }

  return db.createKeyStream(query)
    .pipe(get(db, `${type}/**`))
    .pipe(transform(layout))
    .pipe(stringify())
    .pipe(page(false))
    .pipe(concat(type + '/index'))
    .pipe(vinylise(null, '.html'))
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
    .pipe(page(true))
    .pipe(concat())
    .pipe(vinylise(null, '/index.html'))
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
function concat (fixedKey) {
  var key = fixedKey
  var value = ''

  return stream.obj(function (data, encoding, cb) {
    if (!key) {
      key = data.key
    }
    value += data.value ? data.value : ''

    cb()
  }, function (cb) {
    cb(null, {
      key: fixedKey ? fixedKey : key,
      value: value
    })
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

function page (detail) {
  var ongoing

  return stream.obj(function (data, encoding, cb) {
    if (!ongoing) {
      var ongoing = true
      var tags = require('./layouts/tags')
      var domain = 'https://distilled.pm/'
      var entry = detail ? data.params.entry : {}
      entry.url = detail ? domain + path.basename(data.key) : domain

      this.push({key: data.key})
      this.push({value: '<!doctype html><html lang="en"><head>'})
      this.push({value: tags.head(entry)})
      this.push({value: '<body>'})
    }
    this.push({value: data.value})
    cb()
  }, function (cb) {
    this.push({value: '</body></html>'})
    cb()
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
        params: value,
        key: data.key,
        value: fn(value)
      })
    }
  })
}

function vinylise (subfolder, append) {
  return stream.obj(function (data, encoding, cb) {
    var base = path.basename(data.key)
    var file = append ? base + append : base

    cb(null, new Vinyl({
      path: subfolder ? path.join(subfolder, file) : file,
      contents: new Buffer(data.value)
    }))
  })
}

function inspect (prop) {
  return stream.obj(function (data, encoding, cb) {
    console.info('CHUNK:', prop ? data[prop] : data)
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
