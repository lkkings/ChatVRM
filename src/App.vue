<script setup lang="ts">
import Loading from '@/components/Loading.vue';
import Menu from '@/components/Menu.vue';
import VrmViewer from '@/components/VrmViewer.vue';
import {useAppStore} from '@/store';
useAppStore().loading()
setTimeout(()=>{
  useAppStore().loaded();
},3000)
</script>
<template>
  <Loading/>
  <VrmViewer/>
  <Menu/>

</template>

<style scoped>

</style>
