<script setup lang="ts">
import Icon from '@/components/Icon.vue'
import { useAppStore } from '@/store';
const appStore = useAppStore();
const openOrCloseCamera = ()=>{
  if(appStore.isopencamera){
    appStore.closeCamera();
  }else{
    appStore.openCarmera();
  }
}
</script>
<template>
  <div class="menu-contanter">
    <transition name="bounce">
    <div v-if="appStore.openmenu" class="button-container">
        <Icon name="mao"/>
        <button @click="openOrCloseCamera" class="video-btn" :title="appStore.opencamera?'关闭相机':'打开相机'">
          <Icon v-if="appStore.opencamera" name="video" class="icon" fill="#23a5d0"/>
          <Icon v-else name="video" class="nion-icon"/>
        </button>
        <button class="menu-item phone" title="视频聊天">
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
</style>
  