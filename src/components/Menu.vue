<script setup lang="ts">
import Icon from './Icon.vue';
const cameraIsOpen = ref(false);
</script>
<template>
  <div class="menu-contanter">
    <div class="button-container">
        <Icon name="mao"/>
        <button class="video-btn">
          <Icon name="video" :class="[cameraIsOpen?'icon': 'nion-icon']" :full="cameraIsOpen?'#11cce0':''"/>
        </button>
        <button class="menu-item phone">
          <Icon name="phone"/>
        </button>
        <button class="menu-item sticker">
          <Icon name="sticker"/>
        </button>
        <button class="menu-item character">
          <Icon name="character"/>
        </button>
        <button class="menu-item background">
          <Icon name="background"/>
        </button>
    </div>
  </div>
</template>
  
<style scoped>
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
  border: none;
  background-color: rgba(255, 0, 0, 0); 
  padding: 0;
}
.menu-item{
  position: absolute;
  width: 48px;
  height: 48px;
  border: none;
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
  