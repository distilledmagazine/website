var html = require('bel')
var raw = require('bel/raw')
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

var contributors = require('./contributors')

module.exports = function (article, site) {
  return html`
    <article style="background-image:url('${article.cover || '/covers/fallback.jpg'}')">
      <div class="surface">
        <h1>
          <a href=${article.permalink}>${article.title}</a>
          ${article.date ? date(new Date(article.date)) : ''}
        </h1>
        ${content(article)}
        ${contributors(article.authors.sort())}
      </div>
    </article>
  `
}

function content (article) {
  return html`<section class="content">
    ${raw(article.content)}
  </section>`
}

function date (date) {
  return html`<time>
    ${months[date.getMonth()]} ${date.getYear() + 1900}
  </time>`
}
