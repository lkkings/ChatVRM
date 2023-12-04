<script setup lang="ts">
const props = defineProps({
    name:{
        type:String,
        required: true
    }
})
const icon = defineAsyncComponent(()=>
import(`@/assets/icon/${props.name}.svg`))


</script>

<template>
    <component :is="icon"/>
</template>
<style scoped>
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
.icon{
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
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