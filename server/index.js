#!/usr/bin/env node
const { createServer } = require('vite')
const runScript = require('./runScript')
const KoaRouter = require('koa-router')
const KoaBody = require('koa-body')
const shell = require('shelljs')
const os = require('os')
const path = require('path')
const fs = require('fs')
const toml = require('@iarna/toml')
const findProcess = require('find-process')
const homedir = os.homedir()
const instancesDir = path.join(homedir, '.monibuca')
const instanceMap = new Map()
const { koaEventStream } = require('fastrx/extention')
const { rx, concat, catchError, map, pipe } = require('fastrx')
const scriptExt = os.platform() == 'win32' ? 'bat' : 'sh'
shell.ln(
  '-sf',
  path.join(__dirname, '../node_modules'),
  path.join(__dirname, './node_modules')
)
process.chdir(__dirname)
if (!fs.existsSync(instancesDir))
  fs.mkdirSync(instancesDir, { recursive: true })

async function delay(time) {
  return new Promise(function(resolve, reject) {
    setTimeout(function(){
      resolve();
    }, time);
  });
};

function getAllInstance() {
  return fs.readdirSync(instancesDir).map(async (f) => {
    const result = toml.parse(fs.readFileSync(path.join(instancesDir, f)))
    result.config = toml.parse(
      fs.readFileSync(path.join(result.Path, 'config.toml'))
    )
    try {
      const g = os.platform() == 'win32' ? /\d+/.exec(
        fs.readFileSync(
          path.join(
            result.Path,
            'shutdown.bat'
          )
        )
      ) : /\d+$/.exec(
        fs.readFileSync(
          path.join(
            result.Path,
            'shutdown.sh'
          )
        ))
      const list = await findProcess('pid', g[0])
      result.pid = g[0]
      if (list.length && list[0].name.startsWith(result.Name)) {
        result.status = 'online'
      } else {
        result.status = 'offline'
      }
    } catch (e) {
      result.status = 'offline'
    }
    instanceMap.set(result.Name, result)
    return result
  })
}

/**
 * 获取实例最新的log日志
 * @param {*} instancesDir 实例目录
 */
async function readLastLog(instancesDir) {
  await delay(200)
  const logPath = path.join(instancesDir, 'debug.log')
  const text = fs.readFileSync((logPath), 'utf-8')
  const index = text.indexOf('permission denied')
  const index2 = text.indexOf('already in use')
  if (index > -1)
    return {
      msg: text,
      // 权限不足
      code: 1
    }
  if (index2 > -1)
    return {
      msg: text,
      // 实例端口被占用
      code: 2
    }
  else
    return {
      msg: text,
      // 创建成功
      code: 0
    }
}

getAllInstance()

const myPlugin = ({
  root, // project root directory, absolute path
  app, // Koa app instance
  server, // raw http server instance
  watcher // chokidar file watcher instance
}) => {
  const router = new KoaRouter()
  router.get('/api/getHomeDir', (ctx) => {
    ctx.body = homedir
  })
  router.get('/api/getGoVersion', (ctx) => {
    ctx.body = shell.exec('go version')
  })
  router.get('/api/getGoEnv', (ctx) => {
    ctx.body = shell.exec('go env')
  })
  router.get('/api/instance/list', async (ctx) => {
    ctx.body = await Promise.all(
      getAllInstance()
    )
  })
  router.get("/api/instance/config", ctx => {
    const instance = instanceMap.get(ctx.query.name)
    ctx.body = toml.parse(fs.readFileSync(path.join(instance.Path, 'config.toml')))
  })
  router.post('/api/instance/config/modify', (ctx) => {
    const instance = instanceMap.get(ctx.query.name)
    fs.writeFileSync(
      path.join(instance.Path, 'config.toml'),
      toml.stringify(ctx.request.body)
    )
    ctx.body = ''
  })
  router.post('/api/instance/restart', (ctx) => {
    const instance = instanceMap.get(ctx.query.name)
    runScript('restart', { cwd: instance.Path })
    ctx.body = ''
  })
  router.post('/api/instance/kill', (ctx) => {
    const instance = instanceMap.get(ctx.query.name)
    runScript('shutdown', { cwd: instance.Path })
    ctx.body = ''
  })
  router.post('/api/instance/start', async (ctx) => {
    const instance = instanceMap.get(ctx.query.name)
    runScript('restart', { cwd: instance.Path })
    ctx.body = await readLastLog(instance.Path)
  })
  router.delete('/api/instance/remove', (ctx) => {
    const instance = instanceMap.get(ctx.query.name)
    instanceMap.delete(instance.Name)
    shell.rm('-f', path.join(instancesDir, instance.Name + '.toml'))
    shell.rm('-rf', instance.Path)
    ctx.body = ''
  })
  router.get('/api/instance/update', koaEventStream, (ctx) => {
    const instance = instanceMap.get(ctx.query.name)
    const childProcess = shell.exec('go get -u', {
      async: true,
      cwd: instance.Path
    })
    const getDataO = (childProcess) =>
      rx
        .merge(
          rx.fromEvent(childProcess.stdout, 'data'),
          rx.fromEvent(childProcess.stderr, 'data')
        )
        .takeUntil(rx.fromEvent(childProcess, 'exit'))
    const dataO1 = getDataO(childProcess)
    const dataO2 = rx((sink) => {
      sink.next(shell.exec('go build', { async: true, cwd: instance.Path }))
      sink.complete()
    }).switchMap(getDataO)
    return pipe(concat(dataO1, dataO2), map(x => "data: " + x))
  })
  router.get('/api/listDir', (ctx) => {
    let input = ctx.query.input
    try {
      let basename = ''
      if (!fs.existsSync(input)) {
        basename = path.basename(input)
        input = input.substr(0, input.length - basename.length)
      }
      ctx.body = fs
        .readdirSync(input)
        .filter((name) => {
          if (basename && !name.startsWith(basename)) return false
          try {
            return fs.statSync(path.join(input, name)).isDirectory()
          } catch (e) {
            return false
          }
        })
        .map((text) => path.join(input, text))
    } catch (e) {
      ctx.body = []
    }
  })
  router.get('/api/instance/create', koaEventStream, (ctx) => {
    const { name, path: dir, clear, info } = ctx.query
    const steps = []
    steps.push(
      rx.bindCallback(fs.access, fs, dir).map((err) => {
        let log = 'data: '
        if (err) {
          fs.mkdirSync(dir, { recursive: true })
          log += '目录已创建\n'
        } else {
          if (clear) {
            shell.rm('-rf', dir + '/*')
            log += '目录已清空\n'
          }
        }
        return log
      }),
      rx.of('event: step\ndata: 1'),
      rx
        .bindNodeCallback(
          fs.writeFile,
          fs,
          path.join(dir, 'main.go'),
          require('./template').main
        )
        .map(() => 'data: 写入main.go文件'),
      rx
        .bindNodeCallback(
          fs.writeFile,
          fs,
          path.join(dir, 'config.toml'),
          decodeURIComponent(info)
        )
        .map(() => 'data: 写入config.toml文件'),
      rx
        .bindNodeCallback(
          fs.writeFile,
          fs,
          path.join(dir, 'restart.' + scriptExt),
          require('./template').restart(name)
        )
        .map(() => 'data: 写入restart.' + scriptExt + '文件'),
      rx.of('event: step\ndata: 2'),
      rx
        .of(null)
        .switchMap(() => {
          const childProcess = shell.exec('go mod init ' + name, {
            async: true,
            cwd: dir
          })
          return rx
            .merge(
              rx.fromEvent(childProcess.stdout, 'data'),
              rx.fromEvent(childProcess.stderr, 'data')
            )
            .takeUntil(rx.fromEvent(childProcess, 'exit'))
        })
        .map((data) => 'data: ' + data),
      rx.of('event: step\ndata: 3'),
      rx
        .of(null)
        .switchMap(() => {
          const childProcess = shell.exec('go build', { async: true, cwd: dir })
          return rx
            .merge(
              rx.fromEvent(childProcess.stdout, 'data'),
              rx.fromEvent(childProcess.stderr, 'data')
            )
            .takeUntil(rx.fromEvent(childProcess, 'exit'))
        })
        .map((data) => 'data: ' + data),
      rx
        .bindNodeCallback(
          fs.writeFile,
          fs,
          path.join(instancesDir, name + '.toml'),
          toml.stringify({ Name: name, Path: dir })
        )
        .map(() => 'data: success')
    )
    return catchError((err) =>
      rx.of('event: exception\ndata: ' + err.toString())
    )(rx.concat(...steps).tap(console.log))
  })
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
