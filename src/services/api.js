import axios from 'axios'

// Base URL da API - ajuste conforme a porta do seu back-end
const API_URL = 'http://localhost:8080/api'

// Flag para usar dados mock (true = dados falsos, false = API real)
// Enquanto os controllers não estiverem prontos, mantenha true
const USE_MOCK = true

// ==================== DADOS MOCK ====================
const mockProdutos = [
  { id: 1, nome: 'Notebook Dell', categoria: 'Informática', quantidade: 15, preco: 3500.00 },
  { id: 2, nome: 'Mouse Logitech', categoria: 'Informática', quantidade: 8, preco: 89.90 },
  { id: 3, nome: 'Teclado Mecânico', categoria: 'Informática', quantidade: 5, preco: 299.90 },
  { id: 4, nome: 'Monitor 24"', categoria: 'Eletrônicos', quantidade: 3, preco: 1200.00 },
  { id: 5, nome: 'Cadeira Gamer', categoria: 'Acessórios', quantidade: 2, preco: 899.90 },
  { id: 6, nome: 'SSD 1TB', categoria: 'Informática', quantidade: 10, preco: 450.00 }
]

let mockMovimentacoes = [
  { id: 1, produto_id: 1, produto_nome: 'Notebook Dell', tipo: 'entrada', quantidade: 5, data: new Date('2026-03-28T10:00:00').toISOString() },
  { id: 2, produto_id: 2, produto_nome: 'Mouse Logitech', tipo: 'saida', quantidade: 2, data: new Date('2026-03-28T14:30:00').toISOString() },
  { id: 3, produto_id: 3, produto_nome: 'Teclado Mecânico', tipo: 'entrada', quantidade: 3, data: new Date('2026-03-29T09:15:00').toISOString() },
  { id: 4, produto_id: 4, produto_nome: 'Monitor 24"', tipo: 'saida', quantidade: 1, data: new Date('2026-03-29T16:45:00').toISOString() }
]

let nextMovId = 5

// Função para atualizar estoque do produto
const atualizarEstoqueProduto = (produtoId, tipo, quantidade) => {
  const produto = mockProdutos.find(p => p.id === produtoId)
  if (produto) {
    if (tipo === 'entrada') {
      produto.quantidade += quantidade
    } else if (tipo === 'saida') {
      produto.quantidade = Math.max(0, produto.quantidade - quantidade)
    }
  }
}

// ==================== CONFIGURAÇÃO AXIOS ====================
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

// Interceptor para tratar erro 401 (não autorizado)
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

// ==================== SERVIÇOS ====================

// Serviço de Produtos
export const produtoService = {
  listar: async () => {
    if (USE_MOCK) {
      return { data: [...mockProdutos] }
    }
    return api.get('/produtos')
  },
  
  buscarPorId: async (id) => {
    if (USE_MOCK) {
      const produto = mockProdutos.find(p => p.id === id)
      return { data: produto }
    }
    return api.get(`/produtos/${id}`)
  },
  
  criar: async (produto) => {
    if (USE_MOCK) {
      const novoId = Math.max(...mockProdutos.map(p => p.id), 0) + 1
      const novoProduto = { ...produto, id: novoId }
      mockProdutos.push(novoProduto)
      return { data: novoProduto }
    }
    return api.post('/produtos', produto)
  },
  
  atualizar: async (id, produto) => {
    if (USE_MOCK) {
      const index = mockProdutos.findIndex(p => p.id === id)
      if (index !== -1) {
        mockProdutos[index] = { ...mockProdutos[index], ...produto, id }
        return { data: mockProdutos[index] }
      }
      throw new Error('Produto não encontrado')
    }
    return api.put(`/produtos/${id}`, produto)
  },
  
  deletar: async (id) => {
    if (USE_MOCK) {
      const index = mockProdutos.findIndex(p => p.id === id)
      if (index !== -1) {
        mockProdutos.splice(index, 1)
        return { data: { success: true } }
      }
      throw new Error('Produto não encontrado')
    }
    return api.delete(`/produtos/${id}`)
  }
}

// Serviço de Movimentações
export const movimentacaoService = {
  listar: async () => {
    if (USE_MOCK) {
      const ordenadas = [...mockMovimentacoes].sort((a, b) => 
        new Date(b.data) - new Date(a.data)
      )
      return { data: ordenadas }
    }
    return api.get('/movimentacoes')
  },
  
  criar: async (movimentacao) => {
    if (USE_MOCK) {
      const produto = mockProdutos.find(p => p.id === movimentacao.produto_id)
      if (!produto) {
        throw new Error('Produto não encontrado')
      }
      
      if (movimentacao.tipo === 'saida' && produto.quantidade < movimentacao.quantidade) {
        throw new Error('Estoque insuficiente')
      }
      
      const novaMov = {
        id: nextMovId++,
        produto_id: movimentacao.produto_id,
        produto_nome: produto.nome,
        tipo: movimentacao.tipo,
        quantidade: movimentacao.quantidade,
        data: movimentacao.data || new Date().toISOString()
      }
      
      mockMovimentacoes.push(novaMov)
      atualizarEstoqueProduto(movimentacao.produto_id, movimentacao.tipo, movimentacao.quantidade)
      
      return { data: novaMov }
    }
    return api.post('/movimentacoes', movimentacao)
  },
  
  deletar: async (id) => {
    if (USE_MOCK) {
      const index = mockMovimentacoes.findIndex(m => m.id === id)
      if (index !== -1) {
        const mov = mockMovimentacoes[index]
        const tipoInverso = mov.tipo === 'entrada' ? 'saida' : 'entrada'
        atualizarEstoqueProduto(mov.produto_id, tipoInverso, mov.quantidade)
        mockMovimentacoes.splice(index, 1)
        return { data: { success: true } }
      }
      throw new Error('Movimentação não encontrada')
    }
    return api.delete(`/movimentacoes/${id}`)
  }
}

// ==================== SERVIÇO DE AUTENTICAÇÃO (VERSÃO COMPLETA) ====================
export const authService = {
  // Login com suporte a mock e API real
  login: async (credenciais) => {
    // Se estiver usando MOCK
    if (USE_MOCK) {
      // Credenciais para teste
      if (credenciais.username === 'admin' && credenciais.password === '123') {
        return {
          data: {
            token: 'fake-jwt-token-admin',
            usuario: {
              id: 1,
              nome: 'Administrador',
              username: 'admin',
              papel: 'ADMIN'
            }
          }
        }
      } else if (credenciais.username === 'funcionario' && credenciais.password === '123') {
        return {
          data: {
            token: 'fake-jwt-token-func',
            usuario: {
              id: 2,
              nome: 'Funcionário',
              username: 'funcionario',
              papel: 'FUNCIONARIO'
            }
          }
        }
      }
      
      // Credenciais inválidas
      return Promise.reject({
        response: {
          data: {
            message: 'Usuário ou senha inválidos'
          }
        }
      })
    }

    // ==================== LOGIN REAL COM BACK-END ====================
    // O back-end espera um objeto com username e password
    // As senhas são criptografadas com BCrypt no back-end
    try {
      const response = await api.post('/auth/login', {
        username: credenciais.username,
        password: credenciais.password
      })
      
      // O back-end deve retornar algo como:
      // {
      //   token: "jwt-token-gerado",
      //   usuario: {
      //     id: 1,
      //     nome: "Administrador",
      //     username: "admin",
      //     papel: "ADMIN"
      //   }
      // }
      
      return response
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  },

  // Logout - remove dados do localStorage
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
  },

  // Recupera os dados do usuário logado
  getUsuario: () => {
    const usuario = localStorage.getItem('usuario')
    return usuario ? JSON.parse(usuario) : null
  },

  // Verifica se o usuário é ADMIN
  isAdmin: () => {
    const usuario = authService.getUsuario()
    return usuario?.papel === 'ADMIN'
  },

  // Verifica se o usuário está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token')
  },

  // Retorna o token JWT
  getToken: () => {
    return localStorage.getItem('token')
  }
}

export default api