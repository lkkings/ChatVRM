<script setup lang="ts">
import Loading from '@/components/Loading.vue';
import Menu from '@/components/Menu.vue';
import VrmViewer from '@/components/VrmViewer.vue';
import Sidebar from '@/components/Sidebar.vue';
import Video from './components/Video.vue';
import {useAppStore} from '@/store';

const appStore = useAppStore();
</script>
<template>
  <Loading/>
  <Sidebar/>
  <VrmViewer/>
  <Menu/>
  <transition name="bounce">
    <Video v-if="appStore.opencamera"/>
  </transition>
  
</template>

<style scoped>
.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}
</style>
