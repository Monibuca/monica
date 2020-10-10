<template>
    <img class="logo" alt="Vue logo" src="../assets/logo.png" />
    <h1 class="msg">Monibuca可视化实例管理器</h1>
</template>

<script>
export default {
    name: "HelloWorld",
};
</script>
<style scoped>
@keyframes logoA {
    to {
        top: 10px;
        width: 32px;
        left: 10px;
    }
}
@keyframes msgA {
    to {
        top: 12px;
        left: 60px;
        font-size: 14px;
    }
}
.logo {
    position: absolute;
    animation: logoA 0.5s ease 2s forwards;
    top: 60px;
    width: 128px;
    left: calc(50vw - 64px);
}
.msg {
    position: absolute;
    top: 260px;
    left: calc(50vw - 138px);
    animation: msgA 0.5s ease 2s forwards;
}
</style>