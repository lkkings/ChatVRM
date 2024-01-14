
<script setup lang="ts">
import Menu from '@/components/Menu.vue';
import Sidebar from '@/components/Sidebar.vue';
import { useRouter } from "vue-router";

const router = useRouter();
onMounted(()=>{
  const room = router.currentRoute.value.query.room as string;
  if(room){
    router.push({
      path: "/room",
      query: {
        id: room ,
      }
    })
  }
  
})

</script>
<template>
  <Sidebar/>
  <Menu/>
</template>
  
  <style scoped>
  </style>
  