import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import Icon from './components/Icon.vue';
import { createPinia } from 'pinia';
import '@/store/index'
import {viewer} from '@/core/vrmViewer/provider';


const app = createApp(App);

app.provide("viewer",viewer);

app.component("Icon",Icon);

app.use(createPinia())
app.mount('#app');