var html = require('bel')
var raw = require('bel/raw')
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

module.exports = function (article, emit) {
  return html`
    <article data-controller="test">
      <section>
        <header style="display:none">
          ${article.header}
          <small data-action="click->test#test">${article.publication}</small>
        </header>
        <div class="info">
          <h1><a href=${article.slug}>${article.title}</a></h1>
          ${article.authors.sort().map(author)}
        </div>
        ${content(article)}
      </section>
      <img class="cover" src=${article.cover || '/covers/fallback.jpg'}>
    </article>
  `
}

function author (name) {
  return html`
    <div class="author">${name}</div>
  `
}

function content (article) {
  var content = article.date ?
    article.content + date(new Date(article.date)) :
    article.content

  return html`<section class="content">
    ${raw(content)}
  </section>`
}

function date (date) {
  return `<time>${months[date.getMonth()]} ${date.getYear() + 1900}</time>`
}
