import {
  ApolloClient,
  ApolloProvider,
  createBatchingNetworkInterface,
  renderToStringWithData
} from 'react-apollo'
import { graphiqlExpress, graphqlExpress } from 'apollo-server-express'

import React from 'react'
import { ServerStyleSheet } from 'styled-components'
import { StaticRouter } from 'react-router-dom'
import express from 'express'
import { minify } from 'html-minifier'
import { renderRoutes } from 'react-router-config'
import routes from 'client/routes'
import schema from '../api'

const router = express.Router()
const assets = require(process.env.RAZZLE_ASSETS_MANIFEST)

router.use(
  '/api',
  express.json(),
  graphqlExpress(req => ({ schema, context: { db: req.app.locals.db } }))
)

router.get('/graphiql', graphiqlExpress({ endpointURL: '/api' }))

router.get('/*', (req, res) => {
  const apolloClient = new ApolloClient({
    ssrMode: true,
    networkInterface: createBatchingNetworkInterface({
      uri:
        process.env.NODE_ENV === 'production'
          ? 'https://pastey.now.sh/api'
          : 'http://localhost:3000/api',
      batchInterval: 10,
      opts: {
        credentials: 'include'
      }
    })
  })

  const context = {}

  const frontend = (
    <ApolloProvider client={apolloClient}>
      <StaticRouter context={context} location={req.url}>
        {renderRoutes(routes)}
      </StaticRouter>
    </ApolloProvider>
  )

  const sheet = new ServerStyleSheet()

  renderToStringWithData(sheet.collectStyles(frontend))
    .then(content => {
      if (context.url) {
        res.redirect(301, context.url)
        return
      }

      const styleTags = sheet.getStyleTags()

      const data = apolloClient.store.getState().apollo.data

      const initialState = {
        apollo: {
          data
        }
      }

      res.status(200)
      res.send(
        minify(
          `<!doctype html>
          <html lang="en">
            <head>
              <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
              <meta charSet='utf-8' />
              <title>#Pastey!</title>
              <meta name="viewport" content="user-scalable=0, initial-scale=1, minimum-scale=1, width=device-width, height=device-height">
              <meta name="description" content="Simple and elegant pasting">
              <meta name="keywords" content="react, paste, pastey, 2017, blog, blogging, facebook">
              <meta name="theme-color" content="#5755d9">
              <link rel="manifest" href="/manifest.json">
              <meta name="msapplication-tap-highlight" content="no">
              <meta name="mobile-web-app-capable" content="yes">
              <meta name="application-name" content="#Pastey!">
              <meta name="apple-mobile-web-app-capable" content="yes">
              <meta name="apple-mobile-web-app-status-bar-style" content="black">
              <meta name="apple-mobile-web-app-title" content="#Pastey!">
              <meta name="msapplication-TileColor" content="#5755d9">
              <meta property="og:url" content="https://pastey.now.sh">
              <meta property="og:type" content="website">
              <meta property="og:title" content="#Pastey!">
              <meta property="og:description" content="Simple and elegant pasting">
              ${styleTags}
              ${assets.client.css
                ? `<link rel="stylesheet" href="${assets.client.css}">`
                : ''}
              ${process.env.NODE_ENV === 'production'
                ? `<script src="${assets.client.js}" defer></script>`
                : `<script src="${assets.client
                    .js}" defer crossorigin></script>`}
            </head>
            <body>
              <div id="root">${content}</div>
              <script charset="utf-8">
              window.__APOLLO_STATE__ = ${JSON.stringify(initialState).replace(
                /</g,
                '\\u003c'
              )}
            </script>
            </body>
          </html>`,
          {
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true
          }
        )
      )
      res.end()
    })
    .catch(err => {
      console.log(err)
      res.status(500)
      res.end()
      throw err
    })
})

export default router
