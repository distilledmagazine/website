var { Application } = require('stimulus')
var Turbolinks = require('turbolinks')

Turbolinks.start()

var app = Application.start()
app.register('authors', require('./controllers/authors-controller'))
