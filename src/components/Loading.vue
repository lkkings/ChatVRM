<script setup lang="ts">
import {useAppStore} from '@/store'
const store = useAppStore()
const name = import.meta.env.APP_NAME

</script>

<template>
    <div class="load-contanter" v-show="store.load">
        <div class="loading-overlay"> 
          <div class="app-name">
            <svg  preserveAspectRatio="none" viewBox="0 0 50 10" class="nion-icon" xmlns="http://www.w3.org/2000/svg">
                <text x="0" y="10" font-family="Arial" font-size="10">{{ name }}</text>
            </svg>
          </div>
            
        </div>
    </div>

</template>
<style scoped>
.load-contanter{
  position: fixed;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 1);
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* 确保在最顶层显示 */
}
.loading-overlay{
  position: relative;
  text-align: center;
  width: 100%;
  height: 100%;
}
.app-name {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: 200px;
  height: 40px;
}

@-webkit-keyframes flicker {
  0%,
	19%,
	21%,
	23%,
	25%,
	54%,
	56%,
	100% {
    box-shadow: 0 0 9px 2px #fc3e9f, 0 0 9px 2px #fc3e9f inset;
  }
  20%,
	24%,
	55% {
    box-shadow: none;
    opacity: 0.8;
  }
}
@keyframes flicker {
  0%,
	19%,
	21%,
	23%,
	25%,
	54%,
	56%,
	100% {
    box-shadow: 0 0 9px 2px #fc3e9f, 0 0 9px 2px #fc3e9f inset;
  }
  20%,
	24%,
	55% {
    box-shadow: none;
    opacity: 0.8;
  }
}
@-webkit-keyframes flicker-icon {
  0%,
	19%,
	21%,
	23%,
	25%,
	54%,
	56%,
	100% {
    fill: #fc3e9f;
  }
  20%,
	24%,
	55% {
    fill: #411a58;
    opacity: 0.8;
  }
}
@keyframes flicker-icon {
  0%,
	19%,
	21%,
	23%,
	25%,
	54%,
	56%,
	100% {
    fill: #fc3e9f;
  }
  20%,
	24%,
	55% {
    fill: #411a58;
    opacity: 0.8;
  }
}
* {
  box-sizing: border-box;
}
.nion-icon{
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  opacity: 1;
  visibility: visible;
  transition-delay: 500ms;
}
.nion-icon{
  -webkit-animation: flicker-icon 1.5s infinite alternate;
  animation: flicker-icon 1.5s infinite alternate;
}
</style>