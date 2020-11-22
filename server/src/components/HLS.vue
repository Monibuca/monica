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
      var hls = new Hls()
      let video = ctx.$el
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = props.url
        video.addEventListener('loadedmetadata', function () {
          video.play()
        })
      } else {
        hls.loadSource(props.url)
        hls.attachMedia(video)
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play()
        })
        console.log(hls)
      }

      watchEffect(() => {
        if (!props.visible) {
          video.pause()
          hls.detachMedia(video)
          hls.stopLoad()
          hls.destroy()
        } else {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = props.url
          } else {
            hls = new Hls()
            hls.loadSource(props.url)
            hls.attachMedia(video)
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
              video.play()
            })
          }
        }
      })
    })
  }
}
</script>