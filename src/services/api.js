import axios from 'axios'

// CONFIGURAÇÃO AXIOS
const API_URL = 'http://localhost:8080/api'   

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// adiciona o token JWT automaticamente em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

//trata erro 401 
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// SERVIÇO DE PRODUTOS
export const produtoService = {
  listar: () => api.get('/produtos'),
  
  buscarPorId: (id) => api.get(`/produtos/${id}`),
  
  criar: (produto) => api.post('/produtos', produto),
  
  atualizar: (id, produto) => api.put(`/produtos/${id}`, produto),
  
  deletar: (id) => api.delete(`/produtos/${id}`)
}

// SERVIÇO DE MOVIMENTAÇÕES
export const movimentacaoService = {
  listar: () => api.get('/movimentacoes'),
  
  criar: (movimentacao) => api.post('/movimentacoes', movimentacao),
  
  deletar: (id) => api.delete(`/movimentacoes/${id}`)
}

//  SERVIÇO DE AUTENTICAÇÃO 
export const authService = {
  login: (credenciais) => {
    return api.post('/auth/login', {
      username: credenciais.username,
      password: credenciais.password
    })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    localStorage.removeItem('user')
  },

  // Recupera usuário do localStorage 
  getUsuario: () => {
    const usuario = localStorage.getItem('user') || localStorage.getItem('usuario')
    return usuario ? JSON.parse(usuario) : null
  },

  // Verifica se é ADMIN 
  isAdmin: () => {
    const usuario = authService.getUsuario()
    return usuario?.role === 'ADMIN' || usuario?.papel === 'ADMIN'
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token')
  },

  getToken: () => {
    return localStorage.getItem('token')
  }
}

export default api