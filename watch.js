var chokidar = require('chokidar')
var cp = require('child_process')
var path = require('path')
var opts = {
  ignoreInitial: true
}

var articles = chokidar.watch('./assets/**/*.md', opts)
articles.on('add', article)
articles.on('change', article)
articles.on('unlink', article)

var elements = chokidar.watch('./elements/*.js', opts)
elements.on('change', element)

var styles = chokidar.watch('./assets/styles/*.css', opts)
styles.on('add', style)
styles.on('change', style)
styles.on('unlink', style)

function article (file) {
  var name = path.basename(file, '.md')
  var targets = []
  targets.push(`${name}/index.html`)
  if (file.includes('/pamphlets/')) {
    targets.push('index.html')
  }
  build(...targets)
  log(file, targets)
}

function element (file) {
  var target = '**/*.html'
  build(target)
  log(file, target)
}

function style (file) {
  var target = path.basename(file)
  build(target)
  log(file, target)
}

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
