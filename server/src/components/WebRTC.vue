<template>
  <video
    :srcObject.prop="stream"
    width="488"
    height="275"
    autoplay
    muted
    controls
  ></video>
</template>
<script>
import { onMounted, watchEffect, ref } from 'vue'
import { message } from 'ant-design-vue'
export default {
  props: ['url', 'visible'],
  setup(props) {
    const stream = ref(null)
    onMounted(() => {
      let pc = new RTCPeerConnection()
      const play = async (pc) => {
        pc.addTransceiver('video', {
          direction: 'recvonly'
        })
        pc.onsignalingstatechange = (e) => {
          //console.log(e);
        }
        pc.oniceconnectionstatechange = (e) => {
          message.info(pc.iceConnectionState)
        }
        pc.onicecandidate = (event) => {
          console.log(event)
        }
        pc.ontrack = (event) => {
          if (event.track.kind == 'video') stream.value = event.streams[0]
        }
        await pc.setLocalDescription(await pc.createOffer())
        const res = await fetch(props.url, {
          method: 'POST',
          body: JSON.stringify(pc.localDescription.toJSON())
        })
        if (res.ok) {
          const result = await res.json()
          if (result.errmsg) message.error(result.errmsg)
          else return pc.setRemoteDescription(new RTCSessionDescription(result))
        }
      }
      play(pc)
      watchEffect(() => {
        if (!props.visible) {
          pc.close()
        } else {
          play((pc = new RTCPeerConnection()))
        }
      })
    })
    return {
      stream
    }
  }
}
</script>