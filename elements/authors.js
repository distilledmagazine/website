var html = require('bel')

module.exports = function (authors) {
  return html`<div data-controller="authors">
    ${authors.map(author)}
  </div>`
}

function author (name) {
  return html`<div class="author">${name}</div>`
}
