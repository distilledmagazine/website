var { Controller } = require('stimulus')
var contributors = require('../elements/contributors')
var morph = require('nanomorph')
var shuffle = require('shuffle-array')

module.exports = class ContributorsController extends Controller {
  initialize () {
    morph(this.element, contributors(this.shuffled))
  }

  get shuffled () {
    return shuffle(this.state)
  }

  get state () {
    return Array.from(this.element.children).map(el => el.innerText)
  }
}
