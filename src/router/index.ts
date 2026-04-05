import { createRouter, createWebHistory } from 'vue-router'

// 定义路由配置
const routes = [
  {
    path: '/',
    name: 'product-selection',
    component: () => import('@/pages/ProductSelection.vue'),
    meta: {
      title: '产品选择'
    }
  },
  {
    path: '/quote',
    name: 'quote',
    component: () => import('@/pages/QuotePage.vue'),
    meta: {
      title: '报价单'
    }
  },
  {
    path: '/share/:id',
    name: 'share',
    component: () => import('@/pages/SharePage.vue'),
    meta: {
      title: '分享报价单'
    }
  },
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || 'App'} - Vue3`
  next()
})

export default router
