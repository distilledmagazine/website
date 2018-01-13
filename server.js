var path = require('path')
var serve = require('serve')

serve(path.join(__dirname, 'public'), {
  port: 1789
})
