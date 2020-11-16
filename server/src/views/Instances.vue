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
              <a-tooltip title="实例配置修改" placement="bottom">
                <setting-outlined @click="configInstance(instance)" />
              </a-tooltip>
              <a-tooltip title="实例依赖更新" placement="bottom">
                <CloudDownloadOutlined @click="updateInstance(instance)" />
              </a-tooltip>
              <a-tooltip title="实例删除" placement="bottom">
                <a-popconfirm
                  :title="`是否删除该实例？`"
                  ok-text="Yes"
                  cancel-text="No"
                  @confirm="removeInstance(instance)"
                >
                  <DeleteOutlined />
                </a-popconfirm>
              </a-tooltip>
            </template>
            <template v-else-if="instance.status == 'online'">
              <a-tooltip title="实例操作面板" placement="bottom">
                <DesktopOutlined
                  @click="$router.push('/dashboard/' + instance.Name)"
                />
              </a-tooltip>
              <a-popconfirm
                title="是否重启实例进程?"
                ok-text="Yes"
                cancel-text="No"
                @confirm="restartInstance(instance)"
              >
                <a-tooltip title="重启实例" placement="bottom">
                  <ReloadOutlined />
                </a-tooltip>
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
              <a-tooltip title="实例启动开关" placement="top">
                <a-switch
                  @change="
                    (checked) =>
                      checked ? startInstance(instance) : killInstance(instance)
                  "
                  :loading="false"
                  :checked="instance.status == 'online'"
                  size="small"
                  style="float: right;"
                />
              </a-tooltip>
            </template>
          </a-card-meta>
        </a-card>
      </a-row>
    </a-layout-content>
    <a-layout-footer>
      <a-button @click="$router.push('/create')">创建新实例</a-button>
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
import { notification } from 'ant-design-vue';
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
    function startInstance(instance) {
      instance.status = ''
      fetch('/api/instance/start?name=' + instance.Name, {
        method: 'POST'
      }).then(response => {
        return response.json()
      }).then(data => {
        // code 是 1 代表失败
        if (data.code != 0) {
          let text = ''
          if (data.code == 1) text = '解决方案：权限不足，需要你采用 root 身份重新启动 monica，然后再次尝试'
          if (data.code == 2) text = '解决方案：该实例某些插件端口和其他正在运行实例插件端口有冲突，需要你进行端口调整，避免启动的插件有端口重复'
          notification['error']({
            message: '创建实例失败',
            description: '失败提示：' + data.msg,
            onClick: () => {
              console.log('Notification Clicked!');
            },
            // 加一行文字
            btn: text
          });
        }
        else $message.success(data.msg)
      })
    }
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
        }).then(response => {
          return response.json()
        }).then(data => {
          // code 是 1 代表失败
          if (data.code != 0) {
            let text = ''
            if (data.code == 1) text = '解决方案：权限不足，需要你采用 root 身份重新启动 monica，然后再次尝试'
            if (data.code == 2) text = '解决方案：该实例某些插件端口和其他正在运行实例插件端口有冲突，需要你进行端口调整，避免启动的插件有端口重复'
            notification['error']({
              message: '创建实例失败',
              description: '失败提示：' + data.msg,
              onClick: () => {
                console.log('Notification Clicked!');
              },
              // 加一行文字
              btn: text
            });
          }
          else $message.success(data.msg)
        })
      },
      restartInstance(instance) {
        instance.status = ''
        fetch('/api/instance/start?name=' + instance.Name, {
          method: 'POST'
        }).then(response => {
          return response.json()
        }).then(data => {
          // code 是 1 代表失败
          if (data.code != 0) {
            let text = ''
            if (data.code == 1) text = '解决方案：权限不足，需要你采用 root 身份重新启动 monica，然后再次尝试'
            if (data.code == 2) text = '解决方案：该实例某些插件端口和其他正在运行实例插件端口有冲突，需要你进行端口调整，避免启动的插件有端口重复'
            notification['error']({
              message: '创建实例失败',
              description: '失败提示：' + data.msg,
              onClick: () => {
                console.log('Notification Clicked!');
              },
              btn: text
            });
          }
          else $message.success('已重启实例')
        })
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
