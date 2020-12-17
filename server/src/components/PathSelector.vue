<template>
  <a-auto-complete
    ref="root"
    v-bind="$attrs"
    :dataSource="candidate"
    allowClear
    @change="onInput"
    @focus="focus"
    @blur="blur"
    open
  />
</template>

<script>
import { getCurrentInstance, ref } from 'vue'
export default {
  name: 'PathSelector',
  setup(props, { emit }) {
    const candidate = ref([])
    let lastInput = ''
    let searching = false
    const search = (v) => {
      searching = true
      fetch('/api/listDir?input=' + v)
        .then((x) => x.json())
        .then((x) => {
          if (lastInput != v) {
            lastInput = v
            search(lastInput)
          } else {
            searching = false
          }
          candidate.value = x
        })
        .catch((reason) => {
          searching = false
        })
    }
    return {
      candidate,
      onInput(value) {
        lastInput = value
        if (!searching) search(lastInput)
      },
      focus(ctx) {
        search(ctx.target.value)
      },
      blur(ctx) {
        candidate.value = []
      }
    }
  }
}
</script>

<style scoped></style>
