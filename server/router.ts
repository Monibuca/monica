import * as Router from 'koa-router'
import * as controller from './controller'
import { IResp } from './types'
const { koaEventStream } = require('fastrx/extention')

const router = new Router()

router.get('/api/getHomeDir', async ctx => {
  let resp: IResp
  try {
    const homedir = await controller.getHomeDir()
    resp = {
      code: 0,
      data: homedir
    }
  } catch (err) {
    resp = {
      code: -1,
      msg: err
    }
  }
  ctx.body = resp
})


router.get('/api/getGoVersion', async ctx => {
  let resp: IResp
  try {
    const data = await controller.getGoVersion()
    console.log('data', data)
    resp = {
      code: 0,
      data
    }
  } catch (err) {
    resp = {
      code: -1,
      msg: err
    }
  }
})

router.get('/api/getGoEnv', async (ctx) => {
  let resp: IResp
  try {
    const data = await controller.getGoEnv()
    resp = {
      code: 0,
      data
    }
  } catch (err) {
    resp = {
      code: -1,
      msg: err
    }
  }
})

router.get('/api/instance/list', async (ctx) => {
  let resp: IResp
  try {
    const data = await controller.getAllInstance()
    resp = {
      code: 0,
      data
    }
  } catch (err) {
    resp = {
      code: -1,
      msg: err
    }
  }
})

router.get('/api/instance/config', async (ctx) => {
  let resp: IResp
  const { name } = ctx.query
  try {
    const data = await controller.getInstanceConfig(name)
    resp = {
      code: 0,
      data
    }
  } catch (err) {
    resp = {
      code: -1,
      msg: err
    }
  }
})

router.post('/api/instance/config/modify', async (ctx) => {
  let resp: IResp
  const { name } = ctx.query
  const { body } = ctx.request
  try {
    const data = await controller.getInstanceConfigModify(name, body)
    resp = {
      code: 0,
      data
    }
  } catch (err) {
    resp = {
      code: -1,
      msg: err
    }
  }
})

router.post('/api/instance/restart', async (ctx) => {
  let resp: IResp
  const { name } = ctx.query
  try {
    const data = await controller.getInstanceRestart(name)
    resp = {
      code: 0,
      data
    }
  } catch (err) {
    resp = {
      code: -1,
      msg: err
    }
  }
})

router.post('/api/instance/kill', async (ctx) => {
  let resp: IResp
  const { name } = ctx.query
  try {
    const data = await controller.getInstanceKill(name)
    resp = {
      code: 0,
      data
    }
  } catch (err) {
    resp = {
      code: -1,
      msg: err
    }
  }
})

router.post('/api/instance/start', async (ctx) => {
  let resp: IResp
  const { name } = ctx.query
  try {
    const data = await controller.getInstanceStart(name)
    resp = {
      code: 0,
      data
    }
  } catch (err) {
    resp = {
      code: -1,
      msg: err
    }
  }
})


router.post('/api/instance/remove', async (ctx) => {
  let resp: IResp
  const { name } = ctx.query
  try {
    const data = await controller.getInstanceRemove(name)
    resp = {
      code: 0,
      data
    }
  } catch (err) {
    resp = {
      code: -1,
      msg: err
    }
  }
})

router.get('/api/instance/update', koaEventStream, async (ctx) => {
  let resp: IResp
  const { name } = ctx.query
  try {
    const data = await controller.getInstanceRemove(name)
    resp = {
      code: 0,
      data
    }
  } catch (err) {
    resp = {
      code: -1,
      msg: err
    }
  }
})

router.get('/api/listDir', koaEventStream, async (ctx) => {
  let resp: IResp
  const { input } = ctx.query
  try {
    const data = await controller.getInstanceRemove(input)
    resp = {
      code: 0,
      data
    }
  } catch (err) {
    resp = {
      code: -1,
      msg: err
    }
  }
})

router.get('/api/instance/create', koaEventStream, async (ctx) => {
  let resp: IResp
  const { name, path: dir, clear, info } = ctx.query
  try {
    const data = await controller.instanceCreate(name, dir, clear, info)
    resp = {
      code: 0,
      data
    }
  } catch (err) {
    resp = {
      code: -1,
      msg: err
    }
  }
})

export default router
