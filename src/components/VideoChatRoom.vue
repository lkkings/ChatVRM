<script setup lang="ts">
import {useAppStore} from '@/store';
import { useRouter } from "vue-router";
import {getCurrentTime} from '@/utils/commonUtil';
import WebRTCClient from '@/core/webrtc/webrtc';
import Viewer from '@/core/viewer/viewer';

 
const router = useRouter();
const appStore = useAppStore();
const webrtc = inject<WebRTCClient>("webrtc") as WebRTCClient;
const viewer = inject<Viewer>('viewer') as Viewer;


const room = router.currentRoute.value.query.id as string;

type ClientDictionary = Record<string, {videoStream:MediaStream | null,audioStream:MediaStream | null,muted:boolean,view:boolean}>; 
type MessageArray = Array<{text:string,self:boolean,name:string,createTime:string}>;
const clients = reactive<ClientDictionary>({});
const messages = ref<MessageArray>([]);
const messageRef = ref();
const localStream = ref<MediaStream|null>(null);
const pinPmode = ref(false);

const scrollIntoBottom = ()=>{
  nextTick(() => {
      messageRef.value[messages.value.length - 1].scrollIntoView();
    });
}


onMounted(async ()=>{
  const devices = await navigator.mediaDevices.enumerateDevices();
  const deviceId = devices[0].deviceId;
  webrtc.captureMicAudio(deviceId);
  const width = 400,height = 600;
  viewer.resize(width,height);
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  webrtc.captureCanvasVideo(canvas);
  localStream.value = webrtc.getLocalVideoStream();
  webrtc.onchatmessage = (name:string,message:string)=>{
    messages.value.push({
      text:message,
      name:name,
      createTime:getCurrentTime(),
      self: false
    });
    scrollIntoBottom();
  }
  webrtc.setListenerTrack((name:string,stream:MediaStream|null,type:number)=>{
    if(!clients[name]){
      clients[name] = {
        videoStream:null,
        audioStream:null,
        muted: false,
        view: true,
      }
    }
    if(type===0){
      clients[name].videoStream = stream;
    }
    if(type===1){
      clients[name].audioStream = stream;
    }
    if (type===2) {
      delete clients[name];
    }
    if (type === 3){
      alert("房主解散了该聊天室");
    }
    console.log("clients",clients)
  });
  webrtc.connect(()=>{
    webrtc.joinRoom(room);
    
  })
})
onUnmounted(()=>webrtc.close());
appStore.closeViewer(); 
const openPinPMode = async ()=>{
  if(pinPmode.value) return;
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const pipWindow = await window.documentPictureInPicture.requestWindow({
    width:  canvas.clientWidth,
    height: canvas.clientHeight,
  });
  pipWindow.document.body.append(canvas);
  pinPmode.value = true;
  // 当画中画窗口关闭时，将播放器移回原位置。
  pipWindow.addEventListener("pagehide", () => {
    const containter = document.getElementById("canvas-contanter") as HTMLElement;
    containter.appendChild(canvas);
    pinPmode.value = false;
  });
}

const openOrCloseCamera = ()=>{
  if(appStore.isopencamera){
    appStore.closeCamera();
  }else{
    appStore.openCarmera();
  }
}

const text = ref("");
const sendChatMessage = ()=>{
  if(text.value==="")return;
  webrtc.chat(text.value);
  messages.value.push({
      text:text.value,
      name:webrtc.user,
      createTime:getCurrentTime(),
      self: true
    });
  text.value = "";
  scrollIntoBottom();
}
</script>

<template> 
    <div id="room-container">
      <div id="preview-container">
      <div class="participant" v-for="(client,key) in clients" :key="key">
        <div class="video-container">
          <button class="button-item full-screen" title="全屏">
            <Icon name="full-screen"/>
          </button>
          <video v-show="client.view" autoplay muted  :srcObject="client.videoStream"/>
          <audio style="display: none;" :muted="client.muted"  :srcObject="client.audioStream" autoplay></audio>
          <button class="button-item eye" @click="client.view=!client.view" :title="client.view?'打开窗口':'关闭窗口'">
            <Icon v-if="client.view" name="eye"/>
            <Icon v-else name="eye-close"/>
          </button>
          <button class="button-item mic" @click="client.muted=!client.muted" :title="client.muted?'打开静音':'关闭静音'">
            <Icon v-if="client.muted" name="mic-off"/>
            <Icon v-else name="mic"/>
          </button>
        </div>
      </div>
    </div>
    <div id="self-container">
      <div class="video-container">
        <video autoplay muted :srcObject="localStream"/>
        <button class="button-item pInp" @click="openPinPMode">
          <Icon v-if="pinPmode" name="pInp" class="icon" fill="#23a5d0" title="画中画"/>
          <Icon v-else  name="pInp" class="nion-icon"/>
        </button>
        <button class="button-item camera" @click="openOrCloseCamera" :title="appStore.opencamera?'关闭相机':'打开相机'">
          <Icon v-if="appStore.opencamera" name="camera" class="icon" fill="#23a5d0"/>
          <Icon v-else  name="camera" class="nion-icon"/>
        </button>
      </div>
    </div>
    <div class="chat-box">
      <div class="chat-messages" >
        <!-- Chat messages go here -->
        <div  v-for="(message, key) in messages" :key="key" :class="message.self?'message-right': 'message-left'" ref="messageRef">
        <div class="message-header">
          <span class="nickname">{{ message.name }}</span>
          <span class="time">{{ message.createTime }}</span>
        </div>
        <div class="message-body">{{ message.text }}</div>
      </div>
      </div>
      <div class="input-container">
        <input type="text" v-model="text" class="message-input"  @keyup.enter="sendChatMessage" placeholder="Type your message...">
        <button class="send-button" @click="sendChatMessage">Send</button>
      </div>
    </div>
    </div>
   
</template>
  
  <style scoped>
    #room-container{
      margin: 0;
      padding: 0;
      background: linear-gradient(45deg, #ff6b6b, #ffb6c1);
      display: flex;
      align-items: stretch;
      justify-content: center;
    }
    #self-container {
      width: 25%;
      height: 90vh;
      background-color: #fff;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      margin: 20px;
      box-sizing: border-box;
      overflow: hidden; /* 隐藏溢出的部分 */
    }
     #preview-container {
      width: 50%;
      height: 90vh;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-around;
      margin: 20px;
      overflow: auto; /* 当内容溢出时自动显示滚动条 */
      box-sizing: border-box;
    }
    .participant {
      width: calc(50% - 20px);/* 设置成三列，可根据需要调整宽度百分比 */
      margin-bottom: 20px;
      background-color: #fff;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      box-sizing: border-box;
      overflow: hidden; /* 防止滚动条出现在此容器 */
    }
    .video-container{
      position: relative;
      height: 100%;
      background: #13131b;
      /*-webkit-mask-image: url("~@/assets/svg/people.svg");*/
      /*mask-image: url("~@/assets/svg/people.svg");*/
      /*mask-repeat: no-repeat;*/
      /*mask-position: center;*/
    }
    .video-container video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
    }
    .chat-box {
      width: 25%;
      height: 90vh;
      padding: 15px;
      background-color: #fff;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      margin-top: 20px;
      margin-right: 10px;
      box-sizing: border-box;
      overflow-y: auto; /* 允许滚动条在此容器内出现 */
      scroll-behavior: smooth; 
    }

    .chat-messages {
      height: 75vh;
      overflow-y: auto;
      /* 不设定 max-height，让它随着聊天内容自动增长 */
    }

    .input-container {
      display: flex;
      margin-top: 15px;
    }

    .message-input {
      flex: 1;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      margin-right: 10px;
    }

    .send-button {
      background-color: #4caf50;
      color: #fff;
      border: none;
      padding: 8px 15px;
      border-radius: 4px;
      cursor: pointer;
    }
.button-item{
  position: absolute;
  width: 28px;
  height: 28px;
  outline: none;
  border: none;
  background-color: rgba(0, 60, 255, 0); 
  top: 10px;
  padding: 0;
}
.full-screen{
  left: 5px;
}
.eye{
  right: 40px;
}
.mic{
  right: 5px;
}
.pInp{
  right: 5px;
}
.camera{
  right: 40px;
}

.message-left {
  background-color: #ecf0f1;
  border-radius: 8px 8px 8px 0;
  margin: 10px 0;
  padding: 10px;
}

.message-right {
  background-color: #3498db;
  color: #ffffff;
  border-radius: 8px 8px 0 8px;
  margin: 10px 0;
  padding: 10px;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.nickname {
  font-weight: bold;
}

.time {
  color: #7f8c8d;
}
  </style>
  