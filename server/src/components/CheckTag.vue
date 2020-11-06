<template>
  {{ text }}
  <a-tag :color="color">{{ tag }}</a-tag>
</template>
<script>
export default {
  props: {
    text: String,
    tag: String,
    color: String
  }
}
</script>
