var html = require('choo/html')
var render = require('quill-render')

module.exports = function (state, emit) {
  return html`
    <article style="background-image:url('${state.entry.cover}')">
      <div class="surface">
        <header>
          Distilled Pamphlets
          <small>Issue ${state.entry.issue}, Volume ${state.entry.volume}</small>
        </header>
        <hr>
        <section class="info">
          <h1>${state.entry.title}</h1>
          ${state.entry.authors.sort().map(author)}
        </section>
        ${content(state.entry.content.ops, state.entry.updated)}
      </div>
    </article>
  `
}

function author (name) {
  return html`
    <div class="author">${name}</div>
  `
}

function content (ops, time) {
  var section = html`<section class="content"></section>`
  section.innerHTML = time ? render(ops) + date(time) : render(ops)

  return section
}

function date (input) {
  var date = new Date(input)
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  return `<time>${months[date.getMonth()]} ${date.getYear() + 1900}</time>`
}
