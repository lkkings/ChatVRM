<script setup lang="ts">
import Viewer from "@/core/vrmViewer/viewer";
import {Results,Holistic,POSE_CONNECTIONS,FACEMESH_TESSELATION,HAND_CONNECTIONS} from "@mediapipe/holistic"
import {drawConnectors, drawLandmarks} from "@mediapipe/drawing_utils"
import {Camera} from "@mediapipe/camera_utils"
const viewer = inject<Viewer>("viewer") as Viewer
const videoRef = ref(null);
console.log(videoRef.value)
let camera: Camera | null = null;
const holistic = new Holistic({
  locateFile: file => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1675471629/${file}`;
  }
});
holistic.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7,
    refineFaceLandmarks: true,
  });
onMounted(()=>{
  console.log("Open Carmera!");
  if(!videoRef.value) throw Error("video element not found!")
  const inputVideo = videoRef.value as HTMLVideoElement
  viewer.bootCapture(inputVideo);
  camera = new Camera(inputVideo, {
    onFrame: async () => {
        await holistic.send({image: inputVideo});
    },
    width: 640,
    height: 480
  });
  let guideCanvas = <HTMLCanvasElement> document.getElementById("guides");
  const onResults = (results:Results) => {
    // Draw landmark guides
    drawResults(results)
    // Animate model
    viewer?.capture(results);
  }
  // Pass holistic a callback function
  holistic.onResults(onResults);
  const drawResults = (results:Results) => {
    guideCanvas.width = inputVideo.videoWidth;
    guideCanvas.height = inputVideo.videoHeight;
    let canvasCtx = guideCanvas.getContext('2d');
    if(!canvasCtx) throw Error("canvasCtx not found!");
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, guideCanvas.width, guideCanvas.height);
    // Use `Mediapipe` drawing functions
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
        color: "#00cff7",
        lineWidth: 4
    });
    drawLandmarks(canvasCtx, results.poseLandmarks, {
      color: "#ff0364",
      lineWidth: 2
    });
    drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, {
      color: "#C0C0C070",
      lineWidth: 1
    });
    if(results.faceLandmarks && results.faceLandmarks.length === 478){
      //draw pupils
      drawLandmarks(canvasCtx, [results.faceLandmarks[468],results.faceLandmarks[468+5]], {
        color: "#ffe603",
        lineWidth: 2
      });
    }
    drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, {
      color: "#eb1064",
      lineWidth: 5
    });
    drawLandmarks(canvasCtx, results.leftHandLandmarks, {
      color: "#00cff7",
      lineWidth: 2
    });
    drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS, {
      color: "#22c3e3",
      lineWidth: 5
    });
    drawLandmarks(canvasCtx, results.rightHandLandmarks, {
      color: "#ff0364",
      lineWidth: 2
    });
  }
  camera?.start()
});
onBeforeUnmount(()=>{
    console.log("Close Carmera!");
    camera?.stop();
    viewer.shutCapture();
});
</script>
<template>
  <div class="video-contanter">
    <div class="preview">
      <canvas class="guides" id="guides"></canvas>
      <video class="input-video" ref="videoRef" autoplay muted playsinline></video>
    </div>
  </div>
</template>
<style>
.guides {
  display: block;
  position: absolute;
  bottom: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 1;
  transform: scale(-1, 1);
}
.preview {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 400px;
  height: 300px;
  overflow: hidden;
  border-radius: 8px;
  background: #222;
}
.input-video {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 100%;
  width: 100%;
  max-width: 400px;
  transform: scale(-1, 1);
}
@media only screen and (max-width: 600px) {
  video {
    max-width: 160px;
  }
}
</style>