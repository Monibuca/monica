<template>
  <fragment v-if="$route.path=='/'">
    <img class="logo" alt="Vue logo" src="../assets/logo.png" />
    <h1 class="msg">Monibuca可视化实例管理器</h1>
  </fragment>
  <fragment v-else>
    <img class="logo-animation-end" alt="Vue logo" src="../assets/logo.png" />
    <h1 class="msg-animation-end">Monibuca可视化实例管理器</h1>
  </fragment>
</template>

<script>
export default {
  name: 'HelloWorld'
}
</script>
<style scoped>
@keyframes logoA {
  to {
    top: 10px;
    width: 32px;
    left: 10px;
    transform: none;
  }
}
@keyframes msgA {
  to {
    top: 12px;
    left: 60px;
    font-size: 14px;
    transform: none;
  }
}
.logo {
  animation: logoA 0.5s ease 2s forwards;
  position: absolute;
  top: 60px;
  width: 128px;
  left: 50%;
  transform: translateX(-50%);
}
.msg {
  animation: msgA 0.5s ease 2s forwards;
  position: absolute;
  top: 260px;
  left: 50%;
  transform: translateX(-50%);
}
.logo-animation-end {
  position: absolute;
  top: 10px;
  width: 32px;
  left: 10px;
}
.msg-animation-end {
  position: absolute;
  top: 12px;
  left: 60px;
  font-size: 14px;
}
</style>
