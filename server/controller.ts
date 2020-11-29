import runScript from './runScript';
import { delay } from './util';
const fs = require('fs')
const os = require('os')
const path = require('path')
const shell = require('shelljs')
const toml = require('@iarna/toml')
const findProcess = require('find-process')
const { rx, concat, catchError, map, pipe } = require('fastrx')
const scriptExt = os.platform() == 'win32' ? 'bat' : 'sh'

const instanceMap = new Map()
const homedir = os.homedir()
const instancesDir = path.join(homedir, '.monibuca')

export async function getHomeDir() {
  const homedir = os.homedir()
  return homedir
}

export async function getAllInstance() {
  return fs.readdirSync(instancesDir).map(async (f) => {
    const result = toml.parse(fs.readFileSync(path.join(instancesDir, f)))
    result.config = toml.parse(
      fs.readFileSync(path.join(result.Path, 'config.toml'))
    )
    try {
      const g =
        os.platform() == 'win32'
          ? /\d+/.exec(fs.readFileSync(path.join(result.Path, 'shutdown.bat')))
          : /\d+$/.exec(fs.readFileSync(path.join(result.Path, 'shutdown.sh')))
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

export async function getGoVersion() {
  const result = shell.exec('go version')
  return result
}

export async function getGoEnv() {
  const result = shell.exec('go env')
  return result
}

export async function getInstanceConfig(name: string) {
  const instance = instanceMap.get(name)
  const result = toml.parse(
    fs.readFileSync(path.join(instance.Path, 'config.toml'))
  )
  return result
}

export async function getInstanceConfigModify(name: string, body) {
  const instance = instanceMap.get(name)
  fs.writeFileSync(
    path.join(instance.Path, 'config.toml'),
    toml.stringify(body)
  )
  const result = 'ok'
  return result
}

export async function getInstanceRestart(name: string) {
  const instance = instanceMap.get(name)
  runScript('restart', { cwd: instance.Path })
  const result = 'ok'
  return result
}

export async function getInstanceKill(name: string) {
  const instance = instanceMap.get(name)
  runScript('shutdown', { cwd: instance.Path })
  const result = 'ok'
  return result
}

export async function getInstanceStart(name: string) {
  const instance = instanceMap.get(name)
  runScript('restart', { cwd: instance.Path })
  await delay(200)
  const logPath = path.join(instancesDir, 'debug.log')
  const text = fs.readFileSync(logPath, 'utf-8')
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

export async function getInstanceRemove(name: string) {
  const instance = instanceMap.get(name)
  instanceMap.delete(instance.Name)
  shell.rm('-f', path.join(instancesDir, instance.Name + '.toml'))
  shell.rm('-rf', instance.Path)
  const result = 'ok'
  return result
}

export async function getInstanceUpdate(name: string) {
  const instance = instanceMap.get(name)
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
  return pipe(
    concat(dataO1, dataO2),
    map((x) => 'data: ' + x)
  )
}

export async function getListDir(input: string) {
  let result
  try {
    let basename = ''
    if (!fs.existsSync(input)) {
      basename = path.basename(input)
      input = input.substr(0, input.length - basename.length)
    }
    result = fs
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
    result = []
  }
  return result
}

export async function instanceCreate(name, dir, clear, info) {
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
}

export {}