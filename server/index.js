const { createServer } = require('vite')
const runScript = require('./runScript')
const KoaRouter = require("koa-router")
const KoaBody = require('koa-body')
const shell = require('shelljs')
const os = require('os')
const path = require('path')
const fs = require('fs')
const toml = require('@iarna/toml')
const findProcess = require('find-process')
const homedir = os.homedir()
const instancesDir = path.join(homedir, ".monibuca")
const instanceMap = new Map()
const { koaEventStream } = require('fastrx/extention')
const { rx, concat } = require('fastrx')
if (!fs.existsSync(instancesDir))
    fs.mkdirSync(instancesDir, { recursive: true })
const myPlugin = ({
    root, // project root directory, absolute path
    app, // Koa app instance
    server, // raw http server instance
    watcher // chokidar file watcher instance
}) => {
    const router = new KoaRouter()
    router.get("/api/getHomeDir", ctx => {
        ctx.body = homedir
    })
    router.get("/api/getGoVersion", ctx => {
        ctx.body = shell.exec("go version")
    })
    router.get("/api/getGoEnv", ctx => {
        ctx.body = shell.exec("go env")
    })
    router.get("/api/instance/list", async ctx => {
        ctx.body = await Promise.all(fs.readdirSync(instancesDir).map(async f => {
            const result = toml.parse(fs.readFileSync(path.join(instancesDir, f)))
            result.config = toml.parse(fs.readFileSync(path.join(result.Path, "config.toml")))
            try {
                const g = /\d+/.exec(fs.readFileSync(path.join(result.Path, os.platform() == "win32" ? "shutdown.bat" : "shutdown.sh")))
                const list = await findProcess("pid", g[0])
                if (list.length) {
                    result.status = 'online'
                } else {
                    result.status = 'offline'
                }
            } catch (e) {
                result.status = 'offline'
            }
            instanceMap.set(result.Name, result)
            return result
        }))
    })
    router.post("/api/instance/config/modify", ctx => {
        const instance = instanceMap.get(ctx.query.name)
        fs.writeFileSync(path.join(instance.Path, "config.toml"), toml.stringify(ctx.request.body))
        ctx.body = ""
    })
    router.post("/api/instance/restart", ctx => {
        const instance = instanceMap.get(ctx.query.name)
        runScript('restart', { cwd: instance.Path })
        ctx.body = ""
    })
    router.post("/api/instance/kill", ctx => {
        const instance = instanceMap.get(ctx.query.name)
        runScript('shutdown', { cwd: instance.Path })
        ctx.body = ""
    })
    router.post("/api/instance/start", ctx => {
        const instance = instanceMap.get(ctx.query.name)
        runScript('restart', { cwd: instance.Path })
        ctx.body = ""
    })
    router.delete("/api/instance/remove", ctx => {
        const instance = instanceMap.get(ctx.query.name)
        instanceMap.delete(instance.Name)
        shell.rm("-f", path.join(instancesDir, instance.Name + ".toml"))
        shell.rm("-rf", instance.Path)
        ctx.body = ""
    })
    router.get("/api/instance/update", koaEventStream, ctx => {
        const instance = instanceMap.get(ctx.query.name)
        const childProcess = shell.exec("go get -u", { async: true, cwd: instance.Path })
        const getDataO = childProcess => rx.merge(rx.fromEvent(childProcess.stdout, "data"), rx.fromEvent(childProcess.stderr, "data")).takeUntil(rx.fromEvent(childProcess, "exit"))
        const dataO1 = getDataO(childProcess)
        const dataO2 = rx(sink => {
            sink.next(shell.exec("go build", { async: true, cwd: instance.Path }))
            sink.complete()
        }).switchMap(getDataO)
        return concat(dataO1, dataO2)
    })
    router.get("/api/listDir", ctx => {
        let input = ctx.query.input
        try {
            let basename = ""
            if (!fs.existsSync(input)) {
                basename = path.basename(input)
                input = input.substr(0, input.length - basename.length)
            }
            ctx.body = fs.readdirSync(input).filter(name => {
                if (basename && !name.startsWith(basename)) return false
                try {
                    return fs.statSync(path.join(input, name)).isDirectory()
                } catch (e) {
                    return false
                }
            }).map(text => path.join(input, text))
        } catch (e) {
            ctx.body = []
        }
    })
    router.get("/api/instance/create", koaEventStream, ctx => {
        let clear = ctx.query.clear

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
            javascriptEnabled: true,
        },
    },
    configureServer: [myPlugin]
}).listen(3000)