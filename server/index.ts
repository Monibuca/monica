#!/usr/bin/env node
import router from './router';
const { createServer } = require('vite')
const KoaBody = require('koa-body')
const os = require('os')
const path = require('path')
const fs = require('fs')
const homedir = os.homedir()
const instancesDir = path.join(homedir, '.monibuca')
// shell.ln(
//   '-sf',
//   path.join(__dirname, '../node_modules'),
//   path.join(__dirname, './node_modules')
// )
process.chdir(__dirname)
if (!fs.existsSync(instancesDir))
  fs.mkdirSync(instancesDir, { recursive: true })

const myPlugin = ({
  root, // project root directory, absolute path
  app, // Koa app instance
  server, // raw http server instance
  watcher // chokidar file watcher instance
}) => {
  app.use(KoaBody())
  app.use(router.routes())
  app.use(async (ctx, next) => {
    await next()
    if (ctx.response.status == 404) {
      console.log('post processing: ', ctx.url)
    }
  })
}

createServer({
  cssPreprocessOptions: {
    less: {
      javascriptEnabled: true
    }
  },
  configureServer: [myPlugin]
}).listen(3000)
console.log("server start at port:3000")

export {}