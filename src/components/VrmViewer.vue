<script setup lang="ts">
import Viewer from '@/core/viewer/viewer';
import WebRTCClient from '@/core/webrtc/webrtc';
import {useAppStore} from '@/store';
useAppStore().loading()
const viewer = inject<Viewer>('viewer') as Viewer;
const webrtc = inject<WebRTCClient>('webrtc') as WebRTCClient;
const onLoad = ()=>{
  useAppStore().loaded();
  viewer?.camera2position();
}

const initViewer = (ele: Element | null | globalThis.ComponentPublicInstance) => {
  if(!ele || ! (ele instanceof HTMLCanvasElement)) return;
  if(!viewer) return;
  const canvas = <HTMLCanvasElement> ele;
  viewer.setup(canvas);
  webrtc.setup(canvas);
  viewer.loadVrm(import.meta.env.APP_EDFAULT_VRM, onLoad);
  canvas.addEventListener("dragover", function (event) {
    event.preventDefault();
  });
  canvas.addEventListener("drop", function (event) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (!files) {
      return;
    }
    const file = files[0];
    if (!file) {
      return;
    }
    const file_type = file.name.split(".").pop();
    if (!file_type){
      return;
    }
    const blob = new Blob([file], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    console.log(`load file url: ${url} file_type: ${file_type}`);
    if (file_type === "vrm") {
      viewer.loadVrm(url, onLoad);
    }
    // if (file_type === 'fbx' ) {
    //   viewer.model?.loadFBX( url );
    // }
    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp']; // 常见的图片文件扩展名列表
    if (imageExtensions.includes(file_type)){
      viewer.changeBackgroundImage(url);
    }
  });
}
</script>

<template>
<div class="fullscreen">
  <canvas :ref="(ele)=>initViewer(ele)"></canvas>
</div>
</template>
<style>
.fullscreen {
  height: 100%; 
  margin: 0;
  padding: 0;
  overflow: hidden;
}

canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>