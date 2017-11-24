var html = require('choo/html')
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

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
          ${article.authors.sort().map(author)}
        </div>
        ${content(article)}
      </div>
    </article>
  `
}

function author (name) {
  return html`
    <div class="author">${name}</div>
  `
}

function content (article) {
  var content = html`<div class="content"></div>`
  content.innerHTML = article.date ?
        article.content + date(new Date(article.date)) :
        article.content
  return content
}

function date (date) {
  return `<time>${months[date.getMonth()]} ${date.getYear() + 1900}</time>`
}
