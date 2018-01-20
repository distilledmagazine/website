var { Controller } = require('stimulus')
var authors = require('../elements/authors')
var morph = require('nanomorph')
var shuffle = require('shuffle-array')

module.exports = class AuthorsController extends Controller {
  initialize () {
    morph(this.element, authors(this.shuffled))
  }

  get shuffled () {
    return shuffle(this.state)
  }

  get state () {
    return Array.from(this.element.children).map(el => el.innerText)
  }
}
