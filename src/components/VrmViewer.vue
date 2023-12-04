<script setup lang="ts">
import Viewer from '@/core/vrmViewer/viewer';
const viewer = inject<Viewer>('viewer');
const initViewer = (ele: Element | null | globalThis.ComponentPublicInstance) => {
  if(!ele || ! (ele instanceof HTMLCanvasElement)) return;
  if(!viewer) return;
  const canvas = <HTMLCanvasElement> ele;
  viewer.setup(canvas);
  viewer.loadVrm(import.meta.env.APP_EDFAULT_VRM);
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
    const blob = new Blob([file], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    if (file_type === "vrm") {
      viewer.loadVrm(url);
    }
    if (file_type === 'fbx' ) {
      viewer.model?.loadFBX( url );
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
  width: 100vw;
  height: 100vh;
  margin: 0;
  overflow: hidden;
}

canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>