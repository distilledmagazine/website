var html = require('bel')
var raw = require('bel/raw')
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

var authors = require('./authors')

module.exports = function (article, site) {
  return html`
    <article style="background-image:url('${article.cover || '/covers/fallback.jpg'}')">
      <div class="surface">
        <h1>
          <a href=${article.permalink}>${article.title}</a>
          <small style="display:none">${article.publication}</small>
        </h1>
        ${content(article)}
        ${authors(article.authors.sort())}
      </div>
    </article>
  `
}

function content (article) {
  var content = article.date
    ? article.content + date(new Date(article.date))
    : article.content

  return html`<section class="content">
    ${raw(content)}
  </section>`
}

function date (date) {
  return `<time>${months[date.getMonth()]} ${date.getYear() + 1900}</time>`
}
