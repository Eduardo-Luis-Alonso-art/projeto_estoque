<template>
  <div class="dashboard">

    <!-- HEADER -->
    <div class="header">
      <h1>Produtos</h1>
      <span class="subtitle">Gerenciamento de produtos</span>
    </div>

    <!-- AÇÕES E BUSCA -->
    <div class="actions-bar">
      <div class="search-area">
        <input 
          v-model="filtroBusca" 
          type="text" 
          placeholder="Buscar..."
          class="search-input"
          @input="buscarProdutos"
        />
      </div>
      <div class="action-buttons">
        <button v-if="isAdmin" class="btn-primary" @click="abrirForm">
          + Novo Produto
        </button>
      </div>
    </div>

    <!-- LISTA -->
    <div class="box">
      <h3>Lista de Produtos</h3>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        Carregando produtos...
      </div>

      <!-- Estado vazio -->
      <div v-else-if="produtos.length === 0" class="empty-state">
        Nenhum produto cadastrado.
      </div>

      <!-- Cabeçalho da tabela -->
      <div v-else class="item header-item">
        <span>Nome</span>
        <span>Categoria</span>
        <span>Quantidade</span>
        <span>Preço</span>
        <span v-if="isAdmin">Ações</span>
      </div>

      <!-- Lista de produtos -->
      <div v-for="p in produtos" :key="p.id" class="item">
        <span class="produto-nome">{{ p.nome }}</span>
        <span class="produto-categoria">{{ p.categoria }}</span>
        <span class="produto-quantidade" :class="{ 'baixo-estoque': p.quantidade <= 5 }">
          {{ p.quantidade }}
        </span>
        <span class="produto-preco">R$ {{ formatarPreco(p.preco) }}</span>

        <div v-if="isAdmin" class="acoes">
          <button class="edit" @click="editar(p)" title="Editar produto">✏️</button>
          <button class="delete" @click="confirmarRemover(p)" title="Remover produto">🗑️</button>
        </div>
      </div>
    </div>

    <!-- FORM MODAL -->
    <div v-if="showForm" class="modal" @click.self="fecharForm">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editando ? "Editar Produto" : "Novo Produto" }}</h3>
          <button class="modal-close" @click="fecharForm">✕</button>
        </div>

        <form @submit.prevent="salvar">
          <div class="form-group">
            <label for="nome">Nome do produto *</label>
            <input 
              id="nome"
              v-model="form.nome" 
              type="text"
              placeholder="Ex: Notebook, Mouse, Teclado..."
              required
              autofocus
            />
          </div>

          <div class="form-group">
            <label for="categoria">Categoria *</label>
            <select id="categoria" v-model="form.categoria" required>
              <option value="">Selecione uma categoria</option>
              <option value="Eletrônicos">Eletrônicos</option>
              <option value="Informática">Informática</option>
              <option value="Escritório">Escritório</option>
              <option value="Acessórios">Acessórios</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          <div class="form-group">
            <label for="quantidade">Quantidade *</label>
            <input 
              id="quantidade"
              v-model.number="form.quantidade" 
              type="number" 
              placeholder="0"
              min="0"
              required
            />
          </div>

          <div class="form-group">
            <label for="preco">Preço (R$) *</label>
            <input 
              id="preco"
              v-model.number="form.preco" 
              type="number" 
              placeholder="0,00"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="fecharForm">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="salvando">
              {{ salvando ? "Salvando..." : (editando ? "Atualizar" : "Salvar") }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de confirmação para remoção -->
    <div v-if="showConfirmModal" class="modal" @click.self="fecharConfirmModal">
      <div class="modal-content confirm-modal">
        <h3>Confirmar exclusão</h3>
        <p>Tem certeza que deseja remover o produto <strong>{{ produtoParaRemover?.nome }}</strong>?</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="fecharConfirmModal">Cancelar</button>
          <button class="btn-danger" @click="removerConfirmado">Remover</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { produtoService, authService } from '../services/api'

export default {
  name: 'ProdutosView',
  
  data() {
    return {
      produtos: [],
      produtosOriginais: [], // Para filtro
      filtroBusca: '',
      loading: false,
      salvando: false,

      showForm: false,
      editando: false,
      showConfirmModal: false,
      produtoParaRemover: null,

      form: {
        id: null,
        nome: "",
        categoria: "",
        quantidade: 0,
        preco: 0
      }
    }
  },

  computed: {
    isAdmin() {
      return authService.isAdmin()
    }
  },

  mounted() {
    this.carregarProdutos()
  },

  methods: {
    async carregarProdutos() {
      this.loading = true
      try {
        const response = await produtoService.listar()
        this.produtos = response.data
        this.produtosOriginais = [...response.data]
      } catch (error) {
        console.error('Erro ao carregar produtos:', error)
        alert('Erro ao carregar produtos. Verifique se o servidor está rodando.')
      } finally {
        this.loading = false
      }
    },

    buscarProdutos() {
      if (!this.filtroBusca.trim()) {
        this.produtos = [...this.produtosOriginais]
        return
      }
      
      const termo = this.filtroBusca.toLowerCase()
      this.produtos = this.produtosOriginais.filter(p => 
        p.nome.toLowerCase().includes(termo) || 
        p.categoria.toLowerCase().includes(termo)
      )
    },

    abrirForm() {
      this.resetForm()
      this.showForm = true
    },

    fecharForm() {
      this.showForm = false
      this.resetForm()
    },

    async salvar() {
      // Validações
      if (!this.form.nome || this.form.nome.trim() === '') {
        alert('Por favor, informe o nome do produto')
        return
      }
      
      if (!this.form.categoria) {
        alert('Por favor, selecione uma categoria')
        return
      }
      
      if (this.form.quantidade < 0) {
        alert('A quantidade não pode ser negativa')
        return
      }
      
      if (this.form.preco < 0) {
        alert('O preço não pode ser negativo')
        return
      }

      this.salvando = true

      try {
        // Formata o nome (capitaliza primeira letra)
        const nomeFormatado = this.form.nome.trim().charAt(0).toUpperCase() + 
                             this.form.nome.trim().slice(1).toLowerCase()

        const produtoData = {
          nome: nomeFormatado,
          categoria: this.form.categoria,
          quantidade: Number(this.form.quantidade),
          preco: Number(this.form.preco)
        }

        if (this.editando) {
          await produtoService.atualizar(this.form.id, produtoData)
        } else {
          await produtoService.criar(produtoData)
        }

        this.fecharForm()
        await this.carregarProdutos()
        alert(this.editando ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!')
        
      } catch (error) {
        console.error('Erro ao salvar produto:', error)
        alert(error.response?.data?.message || 'Erro ao salvar produto. Tente novamente.')
      } finally {
        this.salvando = false
      }
    },

    editar(produto) {
      this.form = { 
        id: produto.id,
        nome: produto.nome,
        categoria: produto.categoria,
        quantidade: produto.quantidade,
        preco: produto.preco
      }
      this.editando = true
      this.showForm = true
    },

    confirmarRemover(produto) {
      this.produtoParaRemover = produto
      this.showConfirmModal = true
    },

    async removerConfirmado() {
      if (this.produtoParaRemover) {
        try {
          await produtoService.deletar(this.produtoParaRemover.id)
          await this.carregarProdutos()
          alert('Produto removido com sucesso!')
        } catch (error) {
          console.error('Erro ao remover produto:', error)
          alert(error.response?.data?.message || 'Erro ao remover produto. Tente novamente.')
        }
      }
      this.fecharConfirmModal()
    },

    fecharConfirmModal() {
      this.showConfirmModal = false
      this.produtoParaRemover = null
    },

    resetForm() {
      this.form = {
        id: null,
        nome: "",
        categoria: "",
        quantidade: 0,
        preco: 0
      }
      this.editando = false
    },

    formatarPreco(valor) {
      if (typeof valor !== 'number') return '0,00'
      return valor.toFixed(2).replace('.', ',')
    }
  }
}
</script>

<style scoped>
/* CONTAINER */
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* HEADER */
.header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

.subtitle {
  color: #64748b;
  font-size: 14px;
}

/* ACTION BAR */
.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

/* SEARCH */
.search-input {
  width: 100%;
  max-width: 320px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  font-size: 14px;
  background: #f8fafc;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* BUTTONS */
.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
}

/* BOX */
.box {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
}

/* TABLE */
.item {
  display: grid;
  grid-template-columns: 1.5fr 1fr 0.8fr 0.8fr 1fr;
  padding: 14px 10px;
  border-bottom: 1px solid #f1f5f9;
  align-items: center;
  font-size: 14px;
}

.item:hover {
  background: #f8fafc;
  border-radius: 8px;
}

.header-item {
  font-weight: 600;
  color: #475569;
  border-bottom: 2px solid #e2e8f0;
  background: #f8fafc;
}

/* PRODUCT INFO */
.produto-nome {
  font-weight: 500;
  color: #0f172a;
}

.produto-categoria {
  background: #e0f2fe;
  color: #0369a1;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  width: fit-content;
}

.produto-quantidade {
  font-weight: 500;
}

.baixo-estoque {
  color: #dc2626;
  font-weight: 700;
}

/* PRICE */
.produto-preco {
  font-weight: 600;
  color: #16a34a;
}

/* ACTIONS */
.acoes {
  display: flex;
  gap: 8px;
}

.acoes button {
  border: none;
  background: #f1f5f9;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
}

.acoes .edit:hover {
  background: #dbeafe;
}

.acoes .delete:hover {
  background: #fee2e2;
}

/* STATES */
.loading-state,
.empty-state {
  text-align: center;
  padding: 30px;
  color: #94a3b8;
}

/* MODAL */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 420px;
  animation: fadeIn 0.2s ease;
}

.confirm-modal {
  text-align: center;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.modal-close {
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
}

/* FORM */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.form-group input,
.form-group select {
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* MODAL ACTIONS */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancel {
  background: #e2e8f0;
  border: none;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
}

.btn-danger {
  background: #ef4444;
  color: white;
  border: none;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
}

/* ANIMAÇÃO */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

</style>