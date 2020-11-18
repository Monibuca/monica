<template>
  <video style="width: 488px; height: 275px"></video>
</template>
<script>
import { getCurrentInstance, onMounted, onUnmounted, watchEffect } from 'vue'
export default {
  props: ['url', 'visible'],
  setup(props) {
    const { ctx } = getCurrentInstance()
    onMounted(() => {
      let flvPlayer = flvjs.createPlayer(
        {
          type: 'flv',
          isLive: true,
          url: props.url
        },
        {
          fixAudioTimestampGap: false
        }
      )
      flvPlayer.attachMediaElement(ctx.$el)
      flvPlayer.load()
      flvPlayer.play()
      watchEffect(() => {
        if (!props.visible) {
          flvPlayer.pause()
          flvPlayer.unload()
          flvPlayer.detachMediaElement()
          flvPlayer.destroy()
        } else {
          flvPlayer = flvjs.createPlayer(
            {
              type: 'flv',
              isLive: true,
              url: props.url
            },
            {
              fixAudioTimestampGap: false
            }
          )
          flvPlayer.attachMediaElement(ctx.$el)
          flvPlayer.load()
          flvPlayer.play()
        }
      })
    })
  }
}
</script>