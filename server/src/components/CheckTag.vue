<template>
  {{ text }}
  <a-tag v-if="tag" :color="status == 3 ? '#F50' : '#87d068'">{{ tag }}</a-tag>
  <a-button
    v-if="status == 3 && index == 0"
    type="link"
    @click="jump('https://studygolang.com/dl')"
    >下载地址</a-button
  >
</template>
<script>
export default {
  props: {
    text: String,
    tag: String,
    status: Number,
    index: Number
  },
  setup() {
    return {
      jump(url) {
        window.open(url, '_blank')
      }
    }
  }
}
</script>
