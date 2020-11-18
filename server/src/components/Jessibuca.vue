<template>
  <canvas width="488" height="275" style="background: black" />
</template>
<script>
import {
  getCurrentInstance,
  onMounted,
  onUnmounted,
  onDeactivated,
  computed,
  watchEffect
} from 'vue'
export default {
  props: ['url', 'visible'],
  setup(props) {
    const { ctx } = getCurrentInstance()
    let h5lc = null
    onMounted(() => {
      h5lc = new Jessibuca({
        canvas: ctx.$el,
        decoder: '/ff.js'
      })
      watchEffect(() => {
        if (!props.visible) {
          h5lc.close()
        } else {
          h5lc.play(props.url)
        }
      })
      h5lc.onLoad = () => h5lc.play(props.url)
    })
    onUnmounted(() => {
      h5lc.destroy()
    })
  }
}
</script>