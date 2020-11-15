<template>
  <a-layout>
    <a-layout-header></a-layout-header>
    <a-layout-content>
      <a-row type="flex">
        <a-card
          hoverable
          style="width: 300px; margin: 10px"
          v-for="instance in instances"
          :key="instance.Name"
        >
          <template class="ant-card-actions" #actions>
            <template v-if="instance.status == 'offline'">
              <setting-outlined @click="configInstance(instance)" />
              <CloudDownloadOutlined @click="updateInstance(instance)" />
              <a-popconfirm
                title="是否删除实例?"
                ok-text="Yes"
                cancel-text="No"
                @confirm="removeInstance(instance)"
              >
                <DeleteOutlined />
              </a-popconfirm>
            </template>
            <template v-else-if="instance.status == 'online'">
              <DesktopOutlined
                @click="$router.push('/dashboard/' + instance.Name)"
              />
              <a-popconfirm
                title="是否重启实例进程?"
                ok-text="Yes"
                cancel-text="No"
                @confirm="restartInstance(instance)"
              >
                <ReloadOutlined />
              </a-popconfirm>
            </template>
          </template>
          <a-card-meta :description="'📁' + instance.Path"
            ><template #title>
              <div
                :class="
                  instance.status == 'offline' ? 'status-red' : 'status-green'
                "
              ></div>
              <span>{{ instance.Name }}</span>
              <span v-if="instance.status == 'online'"
                >[{{ instance.pid }}]</span
              >
              <a-switch
                @change="
                  (checked) =>
                    checked ? startInstance(instance) : killInstance(instance)
                "
                :loading="!instance.status"
                :checked="instance.status == 'online'"
                size="small"
                style="float: right"
              />
            </template>
          </a-card-meta>
        </a-card>
      </a-row>
    </a-layout-content>
    <a-layout-footer>
      <a-button @click="$router.push('/create')"> 创建新实例</a-button>
    </a-layout-footer>
    <a-modal
      :title="currentInstance.Name"
      v-model:visible="visible.config"
      :confirm-loading="confirmLoading"
      @ok="modifyConfig"
    >
      <a-tabs
        v-if="currentInstance.config"
        tab-position="left"
        :style="{ height: '300px' }"
      >
        <a-tab-pane
          v-for="(plugin, name) in currentInstance.config"
          :key="name"
          :tab="name"
        >
          <a-form
            :model="plugin"
            :labelCol="{ span: 8 }"
            :wrapperCol="{ span: 12 }"
          >
            <a-form-item v-for="(v, k) in plugin" :label="k" :key="k">
              <a-input
                v-if="typeof v == 'string'"
                v-model:value="plugin[k]"
              ></a-input>
              <a-input-number
                v-else-if="typeof v == 'number'"
                v-model:value="plugin[k]"
              />
              <a-switch
                v-else-if="typeof v == 'boolean'"
                v-model:checked="plugin[k]"
              />
            </a-form-item>
          </a-form>
        </a-tab-pane>
      </a-tabs>
    </a-modal>
    <a-modal
      :title="currentInstance.Name"
      v-model:visible="visible.update"
      @ok="visible.update = false"
    >
      <pre v-html="updateLog" style="max-height: 50vh"></pre>
    </a-modal>
  </a-layout>
</template>
<script>
import { reactive, ref, onUnmounted, getCurrentInstance } from 'vue'

import fastrx from 'fastrx'
const rx = fastrx.rx
import {
  SettingOutlined,
  ReloadOutlined,
  PoweroffOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  LoadingOutlined,
  FileAddOutlined,
  DesktopOutlined,
  CloudDownloadOutlined
} from '@ant-design/icons-vue'
export default {
  components: {
    SettingOutlined,
    ReloadOutlined,
    PoweroffOutlined,
    DeleteOutlined,
    PlayCircleOutlined,
    LoadingOutlined,
    FileAddOutlined,
    DesktopOutlined,
    CloudDownloadOutlined
  },
  setup() {
    const instances = ref([])

    const unmountedOb = rx.fromLifeHook(onUnmounted)
    const {
      ctx: { $message }
    } = getCurrentInstance()

    rx.interval(5000)
      .startWith(0)
      .switchMap(() =>
        rx
          .fetch('/api/instance/list')
          .switchMap((x) => rx.fromPromise(x.json()))
      )
      .takeUntil(unmountedOb)
      .subscribe((x) => {
        instances.value = x
      })
    // fetch("/api/instance/list")
    //     .then((response) => response.json())
    //     .then((x) => {
    //         instances.push(...x);
    //         // x.forEach((x) => {
    //         //     if (x.config.GateWay) {
    //         //         let port = x.config.GateWay.ListenAddr;
    //         //         if (port[0] != ":") {
    //         //             port = port.substr(port.indexOf(":"));
    //         //         }
    //         //         const es = new EventSource(
    //         //             "http://" +
    //         //                 window.location.hostname +
    //         //                 port +
    //         //                 "/api/summary"
    //         //         );
    //         //         es.onmessage = (msg) => {
    //         //             const data = JSON.parse(msg.data)
    //         //             x.status = "online";
    //         //         };
    //         //         es.onerror = (err) => {
    //         //             x.status = "offline";
    //         //             es.close();
    //         //         };
    //         //         es.onopen = () => {
    //         //             onUnmounted(() => es.close());
    //         //         };
    //         //     }
    //         // });
    //     });
    const visible = reactive({
      config: false,
      update: false,
      create: false
    })
    const confirmLoading = ref(false)
    const commonRes = (msg) => (response) => {
      if (response.ok) {
        $message.success(msg)
      } else {
        $message.error(response.statusText)
      }
    }
    const updateLog = ref('')
    const result = {
      updateLog,
      confirmLoading,
      currentInstance: {},
      instances,
      visible,
      configInstance(instance) {
        result.currentInstance = instance
        visible.config = true
      },
      modifyConfig() {
        confirmLoading.value = true
        fetch(
          '/api/instance/config/modify?name=' + result.currentInstance.Name,
          {
            method: 'POST',
            body: JSON.stringify(result.currentInstance.config),
            headers: {
              'content-type': 'application/json'
            }
          }
        ).then((response) => {
          confirmLoading.value = false
          if (response.ok) {
            visible.config = false
            $message.success('修改配置文件成功')
          } else {
            $message.error(response.statusText)
          }
        })
      },
      killInstance(instance) {
        fetch('/api/instance/kill?name=' + instance.Name, {
          method: 'POST'
        }).then(commonRes('已关闭实例'))
      },
      startInstance(instance) {
        instance.status = ''
        fetch('/api/instance/start?name=' + instance.Name, {
          method: 'POST'
        }).then(commonRes('已启动实例'))
      },
      restartInstance(instance) {
        instance.status = ''
        fetch('/api/instance/restart?name=' + instance.Name, {
          method: 'POST'
        }).then(commonRes('已重启实例'))
      },
      removeInstance(instance) {
        instance.status = ''
        fetch('/api/instance/remove?name=' + instance.Name, {
          method: 'DELETE'
        }).then(commonRes('实例已删除'))
      },
      updateInstance(instance) {
        visible.update = true
        result.currentInstance = instance
        updateLog.value = ''
        rx.fromEventSource('/api/instance/update?name=' + instance.Name)
          .takeUntil(unmountedOb)
          .subscribe(
            (msg) => {
              updateLog.value += msg + '\n'
            },
            (e) => e.target.close(),
            () => {}
          )
      }
    }
    return result
  }
}
</script>
