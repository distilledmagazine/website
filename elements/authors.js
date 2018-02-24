var html = require('bel')

module.exports = function (authors) {
  return html`<section class="authors" data-controller="authors">
    ${authors.map(author)}
  </section>`
}

function author (name) {
  return html`<div class="author">${name}</div>`
}
