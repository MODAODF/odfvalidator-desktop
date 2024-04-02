import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/Home.vue'),
    },
    {
      path: '/detect-report',
      name: 'DetectReport',
      component: () => import('../views/DetectReport.vue'),
    }
  ]
});

export default router;