var html = require('choo/html')

module.exports = function (article, emit) {
  return html`
    <article style="background-image:url('${article.cover || '/covers/fallback.jpg'}')">
      <div class="surface">
        <hr>
        <header>
          ${article.header}
          <small>${article.publication}</small>
        </header>
        <section class="info">
          <h1>${article.title}</h1>
          ${article.authors.sort().map(author)}
        </section>
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
  var section = html`<section class="content"></section>`
  section.innerHTML = article.date ? article.content + date(article.date) : article.content

  return section
}

function date (input) {
  var date = new Date(input)
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  return `<time>${months[date.getMonth()]} ${date.getYear() + 1900}</time>`
}
