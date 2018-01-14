var html = require('bel')
var raw = require('bel/raw')
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

var authors = require('./authors')

module.exports = function (article, emit) {
  return html`
    <article style="background-image:url('${article.cover || '/covers/fallback.jpg'}')">
      <div class="surface">
        <header style="display:none">
          ${article.header}
          <small>${article.publication}</small>
        </header>
        <div class="info">
          <h1><a href=${article.slug}>${article.title}</a></h1>
          ${authors(article.authors.sort())}
        </div>
        ${content(article)}
      </div>
    </article>
  `
}

function content (article) {
  var content = article.date ?
    article.content + date(new Date(article.date)) :
    article.content

  return html`<div class="content">
    ${raw(content)}
  </div>`
}

function date (date) {
  return `<time>${months[date.getMonth()]} ${date.getYear() + 1900}</time>`
}
