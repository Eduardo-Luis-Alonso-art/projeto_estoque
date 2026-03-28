import { createRouter, createWebHistory } from 'vue-router'

import DashboardView from '../views/DashboardView.vue'
import ProdutosView from '../views/ProdutosView.vue'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView
  },
  {
    path: '/produtos',
    name: 'produtos',
    component: ProdutosView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router