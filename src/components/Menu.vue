<script setup lang="ts">
import Icon from '@/components/Icon.vue'
import { useAppStore } from '@/store';
import {NDrawer,NCard } from 'naive-ui'
import Password from '@/components/Password.vue';
import {showMessage} from '@/utils/commonUtil'
import WebRTCClient from '@/core/webrtc/webrtc'
const appStore = useAppStore();
const openOrCloseCamera = ()=>{
  if(appStore.isopencamera){
    appStore.closeCamera();
  }else{
    appStore.openCarmera();
  }
}
const isShowPhone = ref(false);
const isConnected = ref(false);
const roomId = ref("");
const webrtc = inject<WebRTCClient>("webrtc") as WebRTCClient;
const joinRoom = (text:string)=>webrtc.joinRoom(text,(message)=>{
  webrtc.leaveRoom()
});
const createRoom = ()=>webrtc.createRoom((message)=>{
  roomId.value = message["room"];
  isConnected.value = true;
}); 
const shareLink = ()=>{
  // 创建一个临时input元素，将当前页面的URL赋值给它
  const tempInput = document.createElement('input');
  tempInput.value = window.location.href+"?room="+roomId.value;
  document.body.appendChild(tempInput);
  // 选择临时input元素中的文本内容并执行复制操作
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);
  showMessage("Copy Link Success!");
}
const openPhone = ()=>{
  webrtc.setupSignalingChannel((success: any)=>{
    console.log("success",success);
    isShowPhone.value=true;
  },(error:any)=>{
    console.log("error",error);
    showMessage(error["message"]);
  });
}
const onPhoneShow = ()=>{
  console.log("Show Phone")
  
}
const onPhoneHide = ()=>{
  console.log("Hide Phone")
}

</script>
<template>
  <!-- 通话连接侧边栏弹出 -start-->
  <n-drawer :on-after-enter="onPhoneShow" :on-after-leave="onPhoneHide"  v-model:show="isShowPhone" placement="left" :mask-closable="false" :default-width="400" style="background-color: #2E525F;">
    <button class="close" title="关闭窗口" @click="isShowPhone=false">
      <Icon name="close"/>
    </button>
    <n-card style="max-width: 300px;background: #00000030;left: 50px;top: 200px;">
      <Password confirmText="CONNECT" @confirm="joinRoom"></Password>
    </n-card>
    <button v-if="isConnected" @click="shareLink" class="share-button" style="left:50px;top: 400px;width:300px">
      Share Your ChatID: #{{roomId}}
    </button>
    <button v-else @click="createRoom" class="share-button" style="left:50px;top: 400px;width:300px">
      Click To Create Chat Room!
    </button>
  </n-drawer>
   <!-- 通话连接侧边栏弹出 -end-->
  <div class="menu-contanter">
    <transition name="bounce">
    <div v-if="appStore.openmenu" class="button-container">
        <Icon name="mao"/>
        <button @click="openOrCloseCamera" class="video-btn" :title="appStore.opencamera?'关闭相机':'打开相机'">
          <Icon v-if="appStore.opencamera" name="video" class="icon" fill="#23a5d0"/>
          <Icon v-else name="video" class="nion-icon"/>
        </button>
        <button class="menu-item phone" title="视频聊天" @click="openPhone">
          <Icon name="phone"/>
        </button>
        <button class="menu-item sticker" title="贴纸">
          <Icon name="sticker"/>
        </button>
        <button class="menu-item character" title="角色">
          <Icon name="character"/>
        </button>
        <button class="menu-item background" title="背景图片">
          <Icon name="background"/>
        </button>
    </div>
    </transition>

  </div>
</template>
  
<style scoped>
.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.25);
  }
  100% {
    transform: scale(1);
  }
}
.share-button{
  position: absolute;
  padding: 10px 20px;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  text-decoration: none;
  border-radius: 5px;
  border: 2px solid #3498db;
  color: #fff;
  background-color: #3498db;
  transition: background-color 0.3s, color 0.3s, border-color 0.3s;
  cursor: pointer;
  outline: none;
}
.share-button:hover {
  background-color: #2980b9;
  border-color: #2980b9;
}
.share-button:active {
  transform: translateY(2px);
}
.button-container {
  display: block;
  position: absolute;
  bottom: 40px;
  right: 40px;
  width: 160px;
  height: 160px;
}
.video-btn{
  position: absolute;
  width: 80px;
  height: 80px;
  right: 16px;
  bottom: 20px;
  outline: none;
  border: none;
  background-color: rgba(255, 0, 0, 0); 
  padding: 0;
}
.menu-item{
  position: absolute;
  width: 48px;
  height: 48px;
  border: none;
  outline: none;
  background-color: rgba(0, 60, 255, 0); 
  padding: 0;
}
.background{
  right: 100px;
  bottom: 8px;
}
.sticker{
  right: 100px;
  bottom: 56px;
}
.character{
  right: 68px;
  bottom: 100px;
}
.phone{
  right: 10px;
  bottom: 100px;
}
.close{
  position: absolute; 
  width: 40px;
  height: 40px;
  left: 360px;
  top: 10px;
  border: none;
  outline: none;
  background-color: rgba(0, 60, 255, 0); 
  padding: 0;
  z-index: 2;
}
</style>
  