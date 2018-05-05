var Path = require('lazy-path')
var chokidar = require('chokidar')
var cp = require('child_process')

watch('./assets/**/*.md', function article (path) {
  var targets = []
  targets.push(`${path.name}/index.html`)
  if (file.includes('/pamphlets/')) {
    targets.push('index.html')
  }
  return targets
})

watch('./elements/*.js', function element () {
  return '**/*.html'
})

watch('./assets/styles/*.css', function style (path) {
  return path.base
})

function build (...targets) {
  cp.fork('./distill', [
    '--prune',
    '--no-scan',
    ...targets
  ])
}

function log (file, targets) {
  var targetlist = Array.isArray(targets) ? targets.join(', ') : targets
  var msg = file + ' -> ' + targetlist
  process.stdout.write(msg + '\n')
}

function watch (files, map) {
  var handler = path => {
    var targets = map(Path.from(file))
    build(...targets)
    log(file, targets)
  }
  var watcher = chokidar.watch(files, {
    ignoreInitial: true
  })
  watcher.on('add', handler)
  watcher.on('change', handler)
  watcher.on('unlink', handler)
}