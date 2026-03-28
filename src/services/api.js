import axios from 'axios'

// Base URL da API - ajuste conforme a porta do seu back-end
const API_URL = 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Serviço de Produtos
export const produtoService = {
  // GET /produtos
  listar: () => api.get('/produtos'),
  
  // GET /produtos/{id}
  buscarPorId: (id) => api.get(`/produtos/${id}`),
  
  // POST /produtos
  criar: (produto) => api.post('/produtos', produto),
  
  // PUT /produtos/{id}
  atualizar: (id, produto) => api.put(`/produtos/${id}`, produto),
  
  // DELETE /produtos/{id}
  deletar: (id) => api.delete(`/produtos/${id}`)
}

// Serviço de Movimentações (para o Dashboard)
export const movimentacaoService = {
  listar: () => api.get('/movimentacoes'),
  criar: (movimentacao) => api.post('/movimentacoes', movimentacao),
  deletar: (id) => api.delete(`/movimentacoes/${id}`)
}

export const authService = {
  login: async (credenciais) => {
    // LOGIN FAKE
    if (
      credenciais.username === 'admin' &&
      credenciais.password === '123'
    ) {
      return Promise.resolve({
        data: {
          token: 'fake-jwt-token',
          usuario: {
            nome: 'Eduardo',
            papel: 'ADMIN'
          }
        }
      })
    }

    // Simula erro
    return Promise.reject({
      response: {
        data: {
          message: 'Usuário ou senha inválidos'
        }
      }
    })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
  },

  getUsuario: () => {
    const usuario = localStorage.getItem('usuario')
    return usuario ? JSON.parse(usuario) : null
  },

  isAdmin: () => {
    const usuario = authService.getUsuario()
    return usuario?.papel === 'ADMIN'
  }
}

export default api