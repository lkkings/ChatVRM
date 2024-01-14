<script setup lang="ts">
import Loading from '@/components/Loading.vue';
import VrmViewer from '@/components/VrmViewer.vue';
import Video from '@/components/Video.vue';
import { useAppStore } from '@/store';
const appStore = useAppStore();
</script>
<template>
  <Loading/>
  <VrmViewer/>
  <transition name="bounce">
    <Video v-if="appStore.opencamera" v-show="appStore.showMenu"/>
  </transition>
  <div id="main">
    <router-view />
  </div>
</template>

<style scoped>
.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}
</style>
