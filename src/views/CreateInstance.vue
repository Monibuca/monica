<template>
    <a-layout>
        <a-layout-header></a-layout-header>
        <a-layout-content>
            <a-tabs default-active-key="1" tab-position="left">
                <a-tab-pane key="1" tab="选目录">
                    <PathSelector
                        v-model:value="path"
                        style="width: 80%"
                        :defaultActiveFirstOption="false"
                    ></PathSelector>
                    <p></p>
                     <p>说明：</p>
                    <p>您选择的目录将会存放实例创建的所有文件</p>
                    <p>这个目录本质上就是一个项目工程目录</p>
                    <p>如果你需要手动执行shell命令，请在该目录下执行</p>
                </a-tab-pane>
            </a-tabs>
        </a-layout-content>
        <a-layout-footer>
            <a-button>
                <template v-slot:icon> <RightOutlined /></template>
                下一步</a-button
            >
        </a-layout-footer>
    </a-layout>
</template>
<script>
import { ref, watch } from "vue";
import PathSelector from "../components/PathSelector.vue";
import { RightOutlined } from "@ant-design/icons-vue";
export default {
    components: {
        PathSelector,
        RightOutlined,
    },
    setup() {
        const path = ref("");
        fetch("/api/getHomeDir")
            .then((x) => x.text())
            .then((x) => (path.value = x));
        return { path };
    },
};
</script>