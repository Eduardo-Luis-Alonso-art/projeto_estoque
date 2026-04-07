import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../components/Layout.vue'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import ProdutosView from '../views/ProdutosView.vue'
import MovimentacoesView from '../views/MovimentacoesView.vue'  
import RelatoriosView from '../views/RelatoriosView.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { public: true }
  },

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
      },
      {
        path: 'movimentacoes',
        name: 'movimentacoes',
        component: MovimentacoesView  
      },
      {
        path: 'relatorios',
        name: 'relatorios',
        component: RelatoriosView
      }
    ]
  },

  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

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