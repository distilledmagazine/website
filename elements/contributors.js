var html = require('nanohtml')

module.exports = function (contributors) {
  return html`<section class="contributors" data-controller="contributors">
    ${contributors.map(contributor)}
  </section>`
}

function contributor (name) {
  return html`<div class="contributor">${name}</div>`
}
