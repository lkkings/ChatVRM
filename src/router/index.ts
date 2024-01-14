import { createRouter, createWebHistory } from 'vue-router';
import Index from '@/components/Index.vue';
import VideoChatRoom from '@/components/VideoChatRoom.vue';

const routes = [
  { path: '/', name: 'Index', component: Index },
  { path: '/room', name: 'Room', component: VideoChatRoom },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
