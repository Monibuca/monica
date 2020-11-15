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
            ><component
              :is="checkItem.component"
              v-bind="checkItem.props"
            ></component
          ></a-timeline-item>
        </a-timeline>
        <a-row type="flex" justify="center">
          <router-link class="btn" v-if="!checking" to="/instances">下一步</router-link>
        </a-row>
      </a-card>
      <p class="tip">操作提示：如果你的Go环境配置都是正确的，那就点击上面的下一步，进行实例创建和管理哦</p>
    </a-layout-content>
  </a-layout>
</template>
<script>
import { LoadingOutlined, InfoCircleOutlined } from '@ant-design/icons-vue'
import { reactive, ref, h } from 'vue'
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
      ].map((text) => ({
        text,
        status: 0,
        component: () => text
      }))
    )
    rx.concat(
      rx
        .fetch('/api/getGoVersion')
        .switchMap((response) => rx.fromPromise(response.text()))
        .tap((x) => {
          const g = /go(\d+)\.(\d+)\.(\d+)/.exec(x)
          if (g) {
            checkList[0].component = 'CheckTag'
            checkList[0].props = {
              text: checkList[0].text,
              tag: `${g[1]}.${g[2]}.${g[3]}`,
              color: '#87d068'
            }
            if (g[1] == 1 && g[2] >= 13) {
              checkList[0].status = 2
            } else {
              checkList[0].status = 3
              checkList[0].props.color = '#F50'
            }
          } else {
            checkList[0].status = 3
          }
        }),
      rx
        .fetch('/api/getGoEnv')
        .switchMap((response) => rx.fromPromise(response.text()))
        .tap((x) => {
          x = JSON.parse(x)
          let g = /GO111MODULE=(.*)/.exec(x)
          checkList[1].component = 'CheckTag'
          checkList[1].props = {
            text: checkList[1].text,
            tag: g[1] ? g[1] : '自动',
            color: '#87d068'
          }
          checkList[1].status = 2
          g = /GOPATH=(.*)/.exec(x)
          checkList[2].component = 'CheckTag'
          checkList[2].props = {
            text: checkList[2].text,
            tag: g[1],
            color: '#87d068'
          }
          checkList[2].status = 2
          if (!g[1]) {
            checkList[2].props.color = '#F50'
            checkList[2].status = 3
          }
          g = /GOPROXY=(.*)/.exec(x)
          checkList[3].component = 'CheckTag'
          checkList[3].props = {
            text: checkList[3].text,
            tag: g[1],
            color: '#87d068'
          }
          checkList[3].status = 2
          if (!g[1]) {
            checkList[3].props.color = '#F50'
            checkList[3].status = 3
          }
        })
    ).subscribe(
      () => {},
      (err) => {
        checking.value = false
      },
      () => {
        checking.value = false
      }
    )
    return { checkList, checking }
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