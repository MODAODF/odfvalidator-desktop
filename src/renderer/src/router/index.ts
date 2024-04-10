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
      name: 'Report',
      component: () => import('../views/Report.vue'),
    }
  ]
});

export default router;