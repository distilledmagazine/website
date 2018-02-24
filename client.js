var { Application } = require('stimulus')
var Turbolinks = require('turbolinks')

Turbolinks.start()

var app = Application.start()
app.register('contributors', require('./controllers/contributors-controller'))
