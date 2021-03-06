const glob = require('glob')
const Metalsmith = require('metalsmith')
const layouts = require('metalsmith-layouts')
const assets = require('metalsmith-assets')
const sass = require('metalsmith-sass')
const markdown = require('metalsmith-markdown')
const dataMarkdown = require('metalsmith-data-markdown')
const contentful = require('contentful-metalsmith')
const rssfeed = require('metalsmith-rssfeed')
const handlebars = require('handlebars')
// add custom helpers to handlebars
// https://github.com/superwolff/metalsmith-layouts/issues/63
//
// using the global handlebars instance
glob.sync('helpers/*.js').forEach((fileName) => {
  const helper = fileName.split('/').pop().replace('.js', '')

  handlebars.registerHelper(
    helper,
    require(`./${fileName}`)
  )
})

Metalsmith(__dirname)
  .source('src')
  .destination('build')
  .metadata({
    site: {
      title: 'Chocolate Free',
      url: 'http://chocolate-free.com',
      author: 'Amal Nasri'
    }
  })
  .use(contentful({
    space_id: '0w6gaytm0wfv',
    access_token: 'c6653b087ff7b60218a55c469abbb1306f76d1ed3a92bb9a5007f7351084b2ce'
  }))
  .use(layouts({
    engine: 'handlebars',
    partials: 'partials'
  }))
  .use(assets({
    source: 'assets/',
    destination: 'assets/'
  }))
  .use(function (files, metalsmith, done) {
    var metadata = metalsmith.metadata()
    metadata['collections'] = {'articles': []}
    var articles = metadata.collections.articles
    for (var key in files) {
      if (key.indexOf('article') >= 0) {
        articles.push(files[key])
      }
    }
    done()
  })
  .use(sass({
    outputStyle: 'compressed'
  }))
  .use(markdown())
  .use(dataMarkdown({
    removeAttributeAfterwards: true
  }))
  .use(rssfeed({
    siteUrl: 'https://chocolate-free.com',
    collectionKey: 'articles',
    name: 'feed.xml'
  }))
  .build(function (err) {
    if (err) throw err

    console.log('Successfully build metalsmith')
  })
