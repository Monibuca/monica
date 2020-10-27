<template>
    <a-layout>
        <a-layout-header></a-layout-header>
        <a-layout-content style="overflow: auto">
            <a-tabs v-model:activeKey="step" tab-position="left">
                <a-tab-pane key="1" tab="定目录">
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
                <a-tab-pane key="2" tab="起名称">
                    <a-input v-model:value="name"></a-input>
                </a-tab-pane>
                <a-tab-pane key="3" tab="选插件">
                    <a-list item-layout="horizontal" :data-source="plugins">
                        <template v-slot:renderItem="{ item, index }">
                            <a-list-item>
                                <a-list-item-meta :description="item.Desc">
                                    <template v-slot:title>
                                        <a :href="'//' + item.Path">{{
                                            (item.UI ? "📈" : "🧩") + item.Name
                                        }}</a>
                                    </template>
                                </a-list-item-meta>
                                <template v-slot:actions>
                                    <a-checkbox
                                        v-model:checked="item.selected"
                                    ></a-checkbox>
                                </template>
                            </a-list-item>
                        </template>
                    </a-list>
                </a-tab-pane>
                <a-tab-pane key="4" tab="改配置">
                    <a-textarea autosize v-model:value="config" />
                </a-tab-pane>
                <a-tab-pane key="5" tab="创建">
                    <a-steps direction="vertical" :current="currentStep">
                        <a-step
                            v-for="s in steps"
                            :key="s.title"
                            :title="s.title"
                            :description="s.log"
                        />
                    </a-steps>
                </a-tab-pane>
            </a-tabs>
        </a-layout-content>
        <a-layout-footer>
            <a-button @click="next" v-if="step != '4'">
                <template v-slot:icon> <RightOutlined /></template>
                下一步</a-button
            >
            <template v-else>
                <a-button :loading="creating" @click="startCreate">
                    开始创建
                </a-button>
            </template>
            <a-button type="link" style="float: right" @click="$router.go(-1)">
                <template v-slot:icon><ExportOutlined /></template> 退出
            </a-button>
        </a-layout-footer>
    </a-layout>
</template>
<script>
import { ref, watch, getCurrentInstance, reactive } from "vue";
import PathSelector from "../components/PathSelector.vue";
import { RightOutlined, ExportOutlined } from "@ant-design/icons-vue";
import fastrx from "fastrx";
const rx = fastrx.rx;
export default {
    components: {
        PathSelector,
        RightOutlined,
        ExportOutlined,
    },
    setup() {
        const {
            ctx: { $message },
        } = getCurrentInstance();

        const path = ref("");
        const step = ref("1");
        const creating = ref(false);
        const plugins = ref([]);
        const config = ref(`[Monibuca]
# 是否等待流，如果为true则订阅一个尚未发布的流会进入等待发布的状态，否则返回订阅失败
EnableWaitStream = true
EnableAudio = true
EnableVideo = true
# 缓冲环大小默认是2的10次方
RingSize = 10
# 发布流默认过期时间 1分钟
PublishTimeout = 60000000000
[RTMP]
ListenAddr = ":1935"
[GateWay]
ListenAddr = ":8081"
[Jessica]
ListenAddr = ":8080"
[LogRotate]
# 日志存储目录相对或绝对
Path = "logs"
# 日志是否按大小分割，0表示不按大小分割，非零代表按该大小字节进行分割
Size = 0
Days = 1
[Cluster]
# 监听端口代表该服务器为源服务器
ListenAddr = ":2019"
# 源服务器地址，用于向源服务器进行推或拉流
OriginServer = ""
# 推送模式，true表示如果此服务器有发布流，就会推送到源服务器，否则表示拉模式，即如果此服务器有订阅流则从源服务器拉流
Push = true
[HLS]
# 是否开启写磁盘，开启后侦测到发布流就会开始写TS文件
EnableWrite = false
# 是否打开内存模式，在内存中保留TS数据，方便直接读取
EnableMemory = false
# 分片大小 单位秒
Fragment = 10
# 窗口数里，代表一个m3u8文件里面有几个ts
Window = 2
# ts文件存放目录，m3u8会存放在上一级
Path = "resource"
[HDL]
ListenAddr = ":2020"
[TS]
# 是否自动发布，开启后一旦有订阅流就会读取ts文件进行发布，方便测试
AutoPublish = false
# ts存放目录
Path  = "resource"
[Record]
Path = "resource"
# 是否自动发布，开启后一旦有订阅流就会读取flv文件进行发布，方便测试
AutoPublish = false
# 自动录制功能
AutoRecord  = false
[RTSP]
# 端口接收推流
ListenAddr = ":554"
# 开启自动拉流后，一旦有订阅流，就会从RemoteAddr进行拉流
AutoPull = false
Reconnect = true
# 远程地址配合AutoPull配置起作用
RemoteAddr = "rtsp://admin:admin@192.168.1.212:554/cam/realmonitor?channel=1&subtype=1"
# 发布流的名称配合AutoPull配置起作用 远程拉流后在本地起的流名称
StreamPath = "live/rtsp"
#[[RTSP.AutoPullList]]
#URL = "rtsp://admin:admin@192.168.1.212:554/cam/realmonitor?channel=1&subtype=1"
[WebRTC]
# 公网IP地址
PublicIP = "127.0.0.1"
[GB28181]
Serial = "34020000002000000001"
Realm = "3402000000"
Expires = 3600
AutoInvite = false
ListenAddr = "192.168.1.120:5060"`);
        fetch("/api/getHomeDir")
            .then((x) => x.text())
            .then((x) => (path.value = x));
        fetch("https://plugins.monibuca.com/recommend")
            .then((x) => x.json())
            .then(
                (x) => (plugins.value = x.map((y) => ((y.selected = true), y)))
            );
        const clearDir = ref(true);
        const currentStep = ref(0);
        const steps = reactive([
            {
                title: "创建目录",
                log: "",
            },
            {
                title: "",
                log: "",
            },
        ]);
        const name = ref("");
        return {
            path,
            name,
            steps,
            step,
            plugins,
            config,
            creating,
            clearDir,
            currentStep,
            next() {
                if (step.value != "5")
                    step.value = (+step.value + 1).toString();
            },
            startCreate() {
                creating.value = true;
                eventSource = new EventSource(
                    "/api/instance/create?path=" +
                        path.value +
                        "&name=" +
                        name.value +
                        "&info=" +
                        config.value +
                        (clearDir.value ? "&clear=true" : "")
                );
                eventSource.onopen = () => steps.forEach((s.log = ""));
                eventSource.onmessage = (evt) => {
                    steps[currentStep.value].log += evt.data + "\n";
                    if (evt.data == "success") {
                        creating.value = false;
                        eventSource.close();
                    }
                };
                eventSource.addEventListener("exception", (evt) => {
                    steps[currentStep.value].log += evt.data + "\n";
                    creating.value = false;
                    eventSource.close();
                });
                eventSource.addEventListener("step", (evt) => {
                    let [step, msg] = evt.data.split(":");
                    currentStep.value = step | 0;
                    steps[currentStep.value].log += msg + "\n";
                });
            },
        };
    },
};
</script>