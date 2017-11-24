var anchor = require('scroll-to-anchor')
var nanohistory = require('nanohistory')
var nanohref = require('nanohref')
var nanomorph = require('nanomorph')

nanohistory(request)
nanohref(request)

function request (location) {
    var req = new XMLHttpRequest()
    req.addEventListener('load', update(location))
    req.responseType = 'document'
    req.open('GET', location.href)
    req.send()
}

function update (location) {
    return function () {
        var doc = this.responseXML
        nanomorph(document.head, doc.head)
        nanomorph(document.body, doc.body)

        location.hash ? anchor(location.hash, {behaviour: 'smooth'}) : window.scroll(0, 0)
        window.history.pushState({}, null, location.href)
    }
}
