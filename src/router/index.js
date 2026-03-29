import { createRouter, createWebHistory } from 'vue-router'

import Layout from '../components/Layout.vue'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import ProdutosView from '../views/ProdutosView.vue'

const routes = [
  // Rota de login (pública)
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { public: true }
  },

  // Rotas protegidas com Layout (sidebar)
  {
    path: '/',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: DashboardView
      },
      {
        path: 'produtos',
        name: 'produtos',
        component: ProdutosView
      }
    ]
  },

  // Qualquer rota inválida → login
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de autenticação
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token')

  if (!isAuthenticated && to.path !== '/login') {
    next('/login')
  } else if (isAuthenticated && to.path === '/login') {
    next('/')
  } else {
    next()
  }
})

export default router