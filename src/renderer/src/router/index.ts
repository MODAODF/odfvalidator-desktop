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
    },
    {
      path: '/about',
      name: 'About',
      component: () => import('../components/About.vue'),
    }
  ]
});

export default router;