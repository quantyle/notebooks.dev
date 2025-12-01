import type { RouteRecordRaw } from 'vue-router'
import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router/auto'
import HomeView from '@/views/HomeView.vue'
import NotebookView from '@/views/NotebookView.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', component: HomeView },
  { path: '/notebook/:id', component: NotebookView, props: true },
  // { path: '/notebook', component: NotebookView, props: route => ({ id: route.query.id }) },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
