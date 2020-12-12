<template>
  <a-layout>
    <a-layout-header></a-layout-header>
    <a-layout-content>
      <a-card class="box-card">
        <template #title class="clearfix">
          <span v-if="checking">正在检查Go环境配置<LoadingOutlined /></span>
          <span v-else>Go环境检查完毕！</span>
        </template>
        <a-timeline>
          <a-timeline-item
            v-for="(checkItem, i) in checkList"
            :key="i"
            :color="['grey', 'blue', 'green', 'red'][checkItem.status]"
            ><CheckTag v-bind="checkItem"></CheckTag
          >
          <span v-if="checkItem.text == '检查GOPROXY' && checkItem.status == 2">
            请务必确保代理地址能正常获取 go 依赖，否则会导致后面实例获取依赖失败！！推荐使用 https://goproxy.io,direct
          </span>
          </a-timeline-item>
        </a-timeline>
        <a-row type="flex" justify="center" v-if="!checking">
          <router-link class="btn" v-if="allGood" to="/instances"
            >下一步</router-link
          >
          <a-button class="btn" type="link" v-else @click="checkAgain"
            >重新检查</a-button
          >
        </a-row>
      </a-card>
      <p class="tip">
        操作提示： <br />
        1、如果你的Go环境配置都是正确的，那就点击上面的下一步，进行实例创建和管理哦
        <br />
        2、检查GOPROXY处，就算显示检查成功了，也要自己检查下，此代理是否能正常使用，如使用 https://proxy.golang.org,direct ，在没有翻墙的情况下是无法使用的，推荐使用 https://goproxy.io,direct
        <br />
        3、启动 monica 命令
        一定要以管理员的身份启动，不然创建实例会失败。管理员启动教学如下：<br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;window电脑: 自行搜索<br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;mac电脑:
        https://www.jianshu.com/p/f5e09261a064 <br />
        &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;按照上面链接教程设置好后 终端执行 su
        root 然后再执行 monica 命令 启动实例管理器<br />
      </p>
    </a-layout-content>
  </a-layout>
</template>
<script>
import { LoadingOutlined, InfoCircleOutlined } from '@ant-design/icons-vue'
import { reactive, ref, h, computed } from 'vue'
import fastrx from 'fastrx'
import { CheckTag } from '../components/CheckItem'
const rx = fastrx.rx
export default {
  components: {
    LoadingOutlined,
    InfoCircleOutlined,
    CheckTag
  },
  setup() {
    const checking = ref(true)
    const checkList = reactive(
      [
        '检查系统安装的Go运行时版本',
        '检查GO111MODULE',
        '检查GOPATH',
        '检查GOPROXY'
      ].map((text, i) => ({
        text,
        index: i,
        status: 0,
        tag: ''
      }))
    )
    const checkAgainHandler = rx.eventHandler(false)
    checkAgainHandler
      .tap(() => (checking.value = true))
      .switchMapTo(
        rx
          .fromFetch('/api/getGoVersion')
          .switchMap((response) => rx.fromPromise(response.text()))
          .tap((x) => {
            const g = /go(\d+)\.(\d+)\.(\d+)/.exec(x)
            if (g) {
              checkList[0].tag = `${g[1]}.${g[2]}.${g[3]}`
              if (g[1] == 1 && g[2] >= 13) {
                checkList[0].status = 2
              } else {
                checkList[0].status = 3
              }
            } else {
              checkList[0].status = 3
            }
          })
      )
      .switchMapTo(
        rx
          .fromFetch('/api/getGoEnv')
          .switchMap((response) => rx.fromPromise(response.text()))
          .tap((x) => {
            x = JSON.parse(x)
            let g = /GO111MODULE=(.*)/.exec(x)
            checkList[1].tag = g && g[1] ? g[1] : '自动'
            checkList[1].status = 2
            g = /GOPATH=(.*)/.exec(x)
            checkList[2].tag = g ? g[1] : ''
            checkList[2].status = 2
            if (!g || !g[1]) {
              checkList[2].status = 3
            }
            g = /GOPROXY=(.*)/.exec(x)
            checkList[3].tag = g ? g[1] : ''
            checkList[3].status = 2
            if (!g || !g[1]) {
              checkList[3].status = 3
            }
          })
      )
      .subscribe(
        () => {
          checking.value = false
        },
        (err) => {
          checking.value = false
        }
      )
    checkAgainHandler.handler()
    return {
      checkList,
      checking,
      allGood: computed(() => checkList.every((x) => x.status == 2)),
      checkAgain: checkAgainHandler.handler
    }
  }
}
</script>
<style scoped>
@keyframes cardA {
  to {
    transform: scaleY(1);
  }
}
.box-card {
  transform: scaleY(0);
  animation: cardA 0.5s ease 1s forwards;
  overflow: hidden;
  width: 60%;
  margin: auto;
  margin-top: 50px;
}
@keyframes caret {
  50% {
    border-color: transparent;
  }
}

/*文本动画：从宽度为0开始*/
@keyframes text {
  to {
    width: 360px;
  }
}

.load-text {
  display: inline-block;
  height: 16px;
  width: 0;
  overflow: hidden;
  word-break: break-all;
  border-right: 1px solid cyan;
  animation: caret 0.5s step-end infinite, text 4s linear 1s forwards;
}
.btn {
  font-size: 30px;
  font-weight: bold;
}
.tip {
  transform: scaleY(0);
  animation: cardA 0.5s ease 1s forwards;
  font-size: 18px;
  width: 60%;
  margin: auto;
  margin-top: 50px;
  /* text-align: center; */
  /* margin: auto; */
}
</style>
