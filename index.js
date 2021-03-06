const express = require('express')
const {promisify} = require('util')
const client = require('redis').createClient(process.env.REDIS_URL || null)
const getAsync = promisify(client.get).bind(client)

const incrementKey = async (url, data) => {
  const views = isNaN(data) ? 1 : parseInt(data) + 1

  await client.set(url, views)

  return getAsync(url)
}

const getUrl = async (req) => {
  return req.originalUrl
}

const renderImagePixel = (res) => {
  const pixel = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
  const base64Image = new Buffer(pixel, 'base64')

  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': base64Image.length
  })

  res.end(base64Image)
}

const trackView = async (req, res) => {
  const url   = await getUrl(req)
  const data  = await getAsync(url)
  const views = await incrementKey(url, data)

  console.log(`${url} has been viewed ${views} times`)

  renderImagePixel(res)
}

const trackingApp = express()
const trackingPort = process.env.PORT || 3000

trackingApp.get(/.{0,}\.jpg/, trackView)
trackingApp.listen(trackingPort, () => console.log(`Tracking app listening on port ${trackingPort}!`))

// For testing the web app in development,
// uncomment the code below and visit localhost:9090

// const webpageApp = express()
// webpageApp.set('view engine', 'ejs')
// const webpagePort = 9090
// const imageServerUrl = `http://localhost:${trackingPort}`

// webpageApp.get('/', (req, res) => res.render('index', {imageServerUrl: imageServerUrl}))
// webpageApp.listen(webpagePort, () => console.log(`Webpage app listening on port ${webpagePort}!`))

// For testing the web app in production,
// uncomment the code below and visit localhost:9090

// const webpageApp = express()
// webpageApp.set('view engine', 'ejs')
// const webpagePort = 9090
// const imageServerUrl = `http://githubanalytics.herokuapp.com`

// webpageApp.get('/', (req, res) => res.render('index', {imageServerUrl: imageServerUrl}))
// webpageApp.listen(webpagePort, () => console.log(`Webpage app listening on port ${webpagePort}!`))