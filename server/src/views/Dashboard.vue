<template>
  <a-layout>
    <a-layout-header></a-layout-header>
    <a-layout-content style="overflow: auto; padding: 20px">
      <template v-if="data.length">
        <a-descriptions title="正在发布流："></a-descriptions>
        <a-table :columns="columns" :data-source="data">
          <template #type="{ text }">
            <span>
              <a-tag>
                {{ text }}
              </a-tag>
            </span>
          </template>
          <template #operator="item">
            <a-button type="link" @click="preview(item)">预览</a-button>
            <a-button type="link" @click="stop(item)">中止</a-button>
          </template>
        </a-table>
      </template>
      <template v-else>
        Monibuca中还没有发布的流，您可以通过向Monibuca推流或者从远程拉流的方式将视频流传入Monibuca<br />
        发布成功后就可以从Monibuca中订阅流来观看了<br /><br />
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
            placement="right"
            title="StreamPath是发布流的唯一标识，这里显示的地址是帮助您理解这个概念"
          >
            <QuestionCircleOutlined
              style="line-height: 32px; margin-left: 10px"
          /></a-tooltip>
        </a-input-group>
        <a-descriptions>
          <template #title>
            推流地址
            <a-tooltip
              placement="right"
              title="Monibuca接受ffmpeg、OBS等推流工具推流，使用已存在的StreamPath会导致推流失败"
            >
              <QuestionCircleOutlined
                style="line-height: 32px; margin-left: 10px"
            /></a-tooltip>
          </template>
          <a-descriptions-item label="rtmp协议推流地址">
            rtmp://{{ urls.rtmp }}/{{ streamPath }}
          </a-descriptions-item>
          <a-descriptions-item label="rtsp协议推流地址">
            rtsp://{{ urls.rtsp }}/{{ streamPath }}
          </a-descriptions-item>
        </a-descriptions>

        <a-descriptions
          ><template #title>
            拉流转发
            <a-tooltip
              placement="right"
              :title="`从外部拉流导入Monibuca，并以该StreamPath(${streamPath})发布`"
            >
              <QuestionCircleOutlined
                style="line-height: 32px; margin-left: 10px"
            /></a-tooltip>
          </template>
          <a-descriptions-item label="rtsp协议">
            <a-input-search
              v-model:value="urls.rtsppull"
              placeholder="输入远程RTSP的URL"
              enter-button="拉流导入"
              @search="
                pullRequest.next(
                  '//' +
                    urls.gateway +
                    '/rtsp/pull?target=' +
                    urls.rtsppull +
                    '&streamPath=' +
                    streamPath
                )
              "
            />
          </a-descriptions-item>
          <a-descriptions-item label="hls协议">
            <a-input-search
              v-model:value="urls.hlspull"
              placeholder="输入远程m3u8的地址"
              enter-button="拉流导入"
              @search="
                pullRequest.next(
                  '//' +
                    urls.gateway +
                    '/hls/pull?target=' +
                    urls.hlspull +
                    '&streamPath=' +
                    streamPath
                )
              "
            />
          </a-descriptions-item>
        </a-descriptions>
      </template>
    </a-layout-content>
    <a-layout-footer>
      <a-button @click="gotoGateway">去主界面</a-button>
      <a-button type="link" style="float: right" @click="$router.go(-1)">
        <template v-slot:icon><ExportOutlined /></template> 返回
      </a-button>
    </a-layout-footer>
  </a-layout>
  <a-modal :title="currentStream.StreamPath" v-model:visible="showPreview">
    <a-descriptions>
      <template #title>
        播放地址
        <a-tooltip
          placement="right"
          title="可使用ffplay、vlc、flv.js等播放器从Monibuca拉流播放"
        >
          <QuestionCircleOutlined style="line-height: 32px; margin-left: 10px"
        /></a-tooltip>
      </template>
    </a-descriptions>
    <ul>
      <li>rtmp://{{ urls.rtmp }}/{{ currentStream.StreamPath }}</li>
      <li>http://{{ urls.gateway }}/hls/{{ currentStream.StreamPath }}.m3u8</li>
      <li>http://{{ urls.hdl }}/{{ currentStream.StreamPath }}.flv</li>
      <li>ws://{{ urls.jessica }}/{{ currentStream.StreamPath }}.flv</li>
    </ul>
    <template #footer>
      H5预览：
      <a-popover v-model:visible="visibles.hls" title="HLS" trigger="click">
        <template #content>
          <HLS
            :visible="visibles.hls"
            :url="`http://${urls.gateway}/hls/${currentStream.StreamPath}.m3u8`"
          />
        </template>
        <a-button>HLS.js</a-button>
      </a-popover>
      <a-popover
        v-model:visible="visibles.webrtc"
        title="WebRTC"
        trigger="click"
      >
        <template #content>
          <WebRTC
            :visible="visibles.webrtc"
            :url="`http://${urls.gateway}/webrtc/play?streamPath=${currentStream.StreamPath}`"
          />
        </template>
        <a-button>WebRTC</a-button>
      </a-popover>
      <a-popover
        v-model:visible="visibles.flvjs"
        title="flv.js"
        trigger="click"
      >
        <template #content>
          <FlvJS
            :visible="visibles.flvjs"
            :url="`ws://${urls.jessica}/${currentStream.StreamPath}.flv`"
          />
        </template>
        <a-button>Flv.js</a-button>
      </a-popover>
      <a-popover
        v-model:visible="visibles.jessibuca"
        title="Jessibuca"
        trigger="click"
      >
        <template #content>
          <Jessibuca
            :visible="visibles.jessibuca"
            :url="`ws://${urls.jessica}/${currentStream.StreamPath}`"
          />
        </template>
        <a-button>Jessibuca</a-button>
      </a-popover>
    </template>
  </a-modal>
</template>
<script>
import { QuestionCircleOutlined, ExportOutlined } from '@ant-design/icons-vue'
import { reactive, ref, computed, onUnmounted, getCurrentInstance } from 'vue'
import FlvJS from '../components/FlvJs.vue'
import Jessibuca from '../components/Jessibuca.vue'
import WebRTC from '../components/WebRTC.vue'
import HLS from '../components/HLS.vue'
import fastrx from 'fastrx'

const rx = fastrx.rx

export default {
  components: {
    QuestionCircleOutlined,
    ExportOutlined,
    FlvJS,
    Jessibuca,
    WebRTC,
    HLS
  },
  setup() {
    const unmountedOb = rx.fromLifeHook(onUnmounted)
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
    const showPreview = ref(false)
    const currentStream = reactive({})
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
            protocols[p] && protocols[p] == addr[1] ? addr[0] : addr.join(':')
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
    const pullRequest = rx.subject()
    pullRequest
      .switchMap((url) =>
        rx.fromFetch(url).switchMap((res) => {
          if (res.ok) {
            return res.json()
          } else {
            $message.error(res.statusText)
            return rx.empty()
          }
        })
      )
      .subscribe((o) => {
        if (o.code == 0) $message.success('已启动拉流')
        else $message.error(o.msg)
      })
    return {
      data,
      config,
      urls,
      streamPath1,
      streamPath2,
      currentStream,
      showPreview,
      visibles: reactive({ webrtc: false, flvjs: false, jessibuca: false }),
      gotoGateway() {
        const tempwindow = window.open('_blank')
        tempwindow.location= '//' + urls.gateway
      },
      stop(item) {
        fetch(
          '//' + urls.gateway + '/api/stop?stream=' + item.record.StreamPath
        )
      },
      preview(item) {
        showPreview.value = true
        currentStream.StreamPath = item.record.StreamPath
      },
      streamPath: computed(() => streamPath1.value + '/' + streamPath2.value),
      pullRequest,
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
        },
        {
          key: 'Operator',
          title: '操作',
          dataIndex: 'Operator',
          slots: { customRender: 'operator' }
        }
      ]
    }
  }
}
</script>