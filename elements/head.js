module.exports = function (opts) {
  return `
    <head>
      <meta charset="utf-8">
      ${meta('http-equiv', 'x-ua-compatible')('ie-edge')}
      ${meta('name', 'viewport')('width=device-width, initial-scale=1')}

      <title>${opts.title ? opts.title + ' ·' : ''} Distilled Pamphlets</title>

      ${link('canonical')(opts.url)}
      ${link('stylesheet')('/style.css')}
      ${opts.cover ? link('prefetch')(opts.cover) : ''}
      <link rel="alternate" href="/feed.atom" type="application/atom+xml" title="Atom 0.3">

      ${opts.description ? meta('name', 'description')(opts.description) : ''}
      ${meta('name', 'google')('notranslate')}
      ${meta('name', 'generator')('distilledpm/pamphlets')}
      ${meta('name', 'subject')('Current affairs and culture')}
      ${meta('name', 'url')('https://distilled.pm')}
      ${meta('name', 'referrer')('origin')}

      ${meta('property', 'og:url')(opts.url)}
      ${opts.title ? meta('property', 'og:title')(opts.title) : ''}
      ${opts.cover ? meta('property', 'og:image')(opts.cover) : ''}
      ${opts.description ? meta('property', 'og:description')(opts.description) : ''}
      ${meta('property', 'og:site_name')('Distilled Pamphlets')}
      ${meta('property', 'og:locale')('en_IE')}
      ${opts.authors ? opts.authors.map(meta('property', 'article:author')).join('\n') : ''}

      ${meta('name', 'twitter:site')('@distilledpm')}
      ${meta('name', 'twitter:url')(opts.url)}
      ${opts.title ? meta('name', 'twitter:title')(opts.title) : meta('name', 'twitter:title')('Distilled Pamphlets')}
      ${opts.description ? meta('name', 'twitter:description')(opts.description) : ''}
      ${opts.cover ? meta('name', 'twitter:image')(opts.cover) : ''}

      ${opts.title ? meta('itemprop', 'name')(opts.title) : meta('itemprop', 'name')('Distilled Pamphlets')}
      ${opts.description ? meta('itemprop', 'description')(opts.description) : ''}
      ${opts.cover ? meta('itemprop', 'image')(opts.cover) : ''}

      <script src="/turbo.js"></script>
    </head>
  `
}

function link (rel) {
  return function (href) {
    return `<link href="${href}" rel="${rel}">`
  }
}

function meta (type, value) {
  return function (content) {
    return `<meta ${type}="${value}" content="${content}">`
  }
}
