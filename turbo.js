var choo = require('choo')
var morph = require('nanomorph')

var turbo = choo()
turbo.route('**', renderBody)
turbo.use(serverRoute())
turbo.mount('body')

function renderBody () {
    return document.body
}

function serverRoute () {
    function get (href, cb) {
        var req = new XMLHttpRequest()
        req.addEventListener('load', cb)
        req.responseType = 'document'
        req.open('GET', href)
        req.send()
    }

    return function (state, bus) {
        bus.on('resolve', function() {
            get(state.href, function () {
                var doc = this.responseXML
                morph(document.head, doc.head)
                morph(document.body, doc.body)
                bus.emit('render')
            })
        })
    }
}
