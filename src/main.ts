import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import Icon from './components/Icon.vue';
import { createPinia } from 'pinia';
import '@/store/index'
import router from './router';
import {viewer} from '@/core/viewer/provider';
import {webrtc} from '@/core/webrtc/provider'

const app = createApp(App);

app.provide("viewer",viewer);
app.provide("webrtc",webrtc);

app.component("Icon",Icon);

app.use(createPinia());
app.use(router);
app.mount('#app');