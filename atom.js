module.exports.feed = function (entries, updated) {
  return `<?xml version="1.0" encoding="utf-8"?>
    <feed xmlns="http://www.w3.org/2005/Atom">
      <title>Distilled Pamphlets</title>
      <id>https://distilled.pm</id>
      <link href="https://distilled.pm/feed.xml" rel="self" />
      <link href="https://distilled.pm" />
      <updated>${new Date(updated).toISOString()}</updated>
      ${entries}
    </feed>
  `
}

module.exports.entry = function (doc) {
  return `<entry>
    <title>${doc.title}</title>
    <id>${doc.url}</id>
    <link href="${doc.url}" />
    <updated>${new Date(doc.date).toISOString()}</updated>
    <content type="html">${doc.content}</content>
    ${doc.authors.map(author).join('\n')}
  </entry>`
}

function author (name) {
  return `<author>
    <name>${name}</name>
  </author>`
}
