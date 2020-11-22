<template>
  <HelloWorld />
  <div class="tool-bar">
    <a-tag color="#55acee" @click="jump('https://monibuca.com/')">
      <HomeOutlined />
      官方网站
    </a-tag>
    <a-tag color="#55acee" @click="jump('https://github.com/Monibuca')">
      <GithubOutlined />
      Github
    </a-tag>
  </div>
  <router-view v-slot="{ Component }">
    <transition name="fade">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script>
import { GithubOutlined, WechatOutlined, HomeOutlined } from '@ant-design/icons-vue'
import HelloWorld from './components/HelloWorld.vue'
export default {
  name: 'App',
  components: {
    HelloWorld,
    GithubOutlined,
    WechatOutlined,
    HomeOutlined
  },
  setup() {
    return {
      jump(url) {
        const tempwindow = window.open('_blank')
        tempwindow.location= url
      }
    }
  }
}
</script>
<style lang="less">
@import './assets/theme.less';
.tool-bar {
  position: absolute;
  top: 10px;
  right: 10px;
  display: inline-block;
}
html,
body {
  background: #242424;
  color: sandybrown;
  margin: 0;
}
.ant-layout-footer {
  font-size: 12px;
  color: cyan;
  background: unset;
}
.ant-layout {
  height: 100vh;
  background: unset;
}
.ant-layout-header {
  background: unset;
}
.status-green,
.status-yellow,
.status-red {
  display: inline-block;
  border-style: solid;
  border-width: 1px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  box-sizing: border-box;
  margin: 5px;
  vertical-align: middle;
}
.status-green {
  border-color: #16b983;
  background-color: #88f1d4;
  box-shadow: inset -0.6px -1.9px 4px 0px rgba(21, 139, 100, 0.8),
    0px 0px 8px 1px rgba(21, 139, 100, 0.7);
}
.status-yellow {
  border-color: #9c9709;
  background-color: #ffe118;
  box-shadow: inset -0.6px -1.9px 4px 0px rgba(139, 127, 21, 0.8),
    0px 0px 8px 1px rgba(139, 127, 21, 0.7);
}
.status-red {
  border-color: #c22727;
  background-color: #f5436c;
  box-shadow: inset -0.6px -1.9px 4px 0px rgba(139, 21, 21, 0.8),
    0px 0px 8px 1px rgba(139, 21, 21, 0.7);
}
</style>
