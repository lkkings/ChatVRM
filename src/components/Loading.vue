<script setup lang="ts">
import Icon from './Icon.vue';

const name = import.meta.env.APP_NAME

</script>

<template>
    <div class="load-contanter">

        <Icon name="GawrGuar" class="nion-icon"/>
    </div>
 
</template>
<style scoped>
.load-contanter{
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: #000;
    overflow: hidden;
}
.nion-icon {
    position: absolute;
    top: 50%;
    left: 50%;
}
</style>