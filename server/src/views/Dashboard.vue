<template>
  <a-layout>
    <a-layout-header></a-layout-header>
    <a-layout-content style="overflow: auto">
      <a-input-group compact>
        <a-input
          style="width: 200px"
          addon-before="StreamPath:"
          v-model:value="streamPath1"
        ></a-input>
        <a-input
          style="
            width: 30px;
            border-left: 0;
            pointer-events: none;
            backgroundcolor: #fff;
          "
          placeholder="/"
          disabled
        />
        <a-input
          style="width: 100px; border-left: 0"
          v-model:value="streamPath2"
        />
        <a-tooltip
          title="StreamPath是发布流的唯一标识，这里显示的地址是帮助您理解这个概念"
        >
          <QuestionCircleOutlined style="line-height: 32px; margin-left: 10px"
        /></a-tooltip>
      </a-input-group>
      <a-descriptions title="发布地址（推流，可使用ffmpeg、OBS等推流工具推流）">
        <a-descriptions-item label="rtmp协议推流地址">
          rtmp://{{ urls.rtmp }}/{{ streamPath }}
        </a-descriptions-item>
        <a-descriptions-item label="rtsp协议推流地址">
          rtsp://{{ urls.rtsp }}/{{ streamPath }}
        </a-descriptions-item>
      </a-descriptions>
      <a-descriptions
        title="播放地址（拉流，可使用ffplay、vlc或者本页中自带的播放器进行播放）"
      >
        <a-descriptions-item label="rtmp协议播放地址">
          rtmp://{{ urls.rtmp }}/{{ streamPath }}
        </a-descriptions-item>
        <a-descriptions-item label="hls协议播放地址">
          http://{{ urls.gateway }}/hls/{{ streamPath }}.m3u8
        </a-descriptions-item>
        <a-descriptions-item label="http-flv协议播放地址">
          http://{{ urls.hdl }}/hls/{{ streamPath }}.flv
        </a-descriptions-item>
        <a-descriptions-item label="ws-flv协议播放地址">
          ws://{{ urls.jessica }}/{{ streamPath }}.flv
        </a-descriptions-item>
      </a-descriptions>
      <a-table :columns="columns" :data-source="data">
        <template #type="{ text }">
          <span>
            <a-tag>
              {{ text }}
            </a-tag>
          </span>
        </template>
      </a-table>
    </a-layout-content>
    <a-layout-footer>
      <a-button @click="gotoGateway">去主界面</a-button>
      <a-button type="link" style="float: right" @click="$router.go(-1)">
        <template v-slot:icon><ExportOutlined /></template> 退出
      </a-button>
    </a-layout-footer>
  </a-layout>
</template>
<script>
import { QuestionCircleOutlined, ExportOutlined } from '@ant-design/icons-vue'
import { reactive, ref, computed, onUnmounted, getCurrentInstance } from 'vue'
import fastrx from 'fastrx'
const rx = fastrx.rx

export default {
  components: { QuestionCircleOutlined, ExportOutlined },
  setup() {
    const unmountedOb = rx.fromLifeHook(onUnmounted)
    console.log(getCurrentInstance())
    const {
      ctx: {
        $message,
        $router: {
          currentRoute: {
            value: {
              params: { name }
            }
          }
        }
      }
    } = getCurrentInstance()
    const data = ref([])
    const config = ref({})
    const urls = reactive({})
    const streamPath1 = ref('live')
    const streamPath2 = ref('test')
    const protocols = {
      rtmp: '1935',
      rtsp: '554',
      http: '80'
    }
    const urln = ['GateWay', 'RTMP', 'RTSP', 'HDL', 'Jessica']
    rx.fromFetch('/api/instance/config?name=' + name)
      .switchMap((res) => rx.fromPromise(res.json()))
      .switchMap((c) => {
        config.value = c
        urln.forEach((x) => {
          const addr = c[x].ListenAddr.split(':')
          if (!addr[0]) {
            addr[0] = location.hostname
          }
          const p = x.toLowerCase()
          urls[p] =
            protocols[p] && protocols[p] == addr[1] ? addr[1] : addr.join(':')
        })
        return rx.fromEventSource('//' + urls.gateway + '/api/summary')
      })
      .takeUntil(unmountedOb)
      .subscribe(
        (msg) => {
          let summary = JSON.parse(msg)
          summary.Address = location.hostname
          if (!summary.Streams) summary.Streams = []
          summary.Streams.sort((a, b) => (a.StreamPath > b.StreamPath ? 1 : -1))
          data.value = summary.Streams
        },
        (e) => e.target.close()
      )
    return {
      data,
      config,
      urls,
      streamPath1,
      streamPath2,
      gotoGateway() {
        location.href = '//' + urls.gateway
      },
      streamPath: computed(() => streamPath1.value + '/' + streamPath2.value),
      columns: [
        {
          key: 'Type',
          title: '类型',
          dataIndex: 'Type',
          slots: { customRender: 'type' }
        },
        {
          key: 'StreamPath',
          title: 'StreamPath',
          dataIndex: 'StreamPath'
        }
      ]
    }
  }
}
</script>