<template>
  <div class="dashboard">

    <!-- HEADER -->
    <div class="header">
      <h1>Produtos</h1>
      <span class="subtitle">Gerenciamento de produtos</span>
    </div>

    <!-- AÇÕES -->
    <div class="actions">
      <button class="btn-primary" @click="abrirForm">
        + Novo Produto
      </button>
    </div>

    <!-- LISTA -->
    <div class="box">
      <h3>Lista de Produtos</h3>

      <!-- Estado vazio -->
      <div v-if="produtos.length === 0" class="empty-state">
        Nenhum produto cadastrado. Clique em "Novo Produto" para começar.
      </div>

      <!-- Cabeçalho da tabela -->
      <div v-else class="item header-item">
        <span>Nome</span>
        <span>Quantidade</span>
        <span>Preço</span>
        <span>Ações</span>
      </div>

      <!-- Lista de produtos -->
      <div v-for="p in produtos" :key="p.id" class="item">
        <span class="produto-nome">{{ p.nome }}</span>
        <span class="produto-quantidade">{{ p.quantidade }}</span>
        <span class="produto-preco">R$ {{ formatarPreco(p.preco) }}</span>

        <div class="acoes">
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
            <button type="submit" class="btn-primary">
              {{ editando ? "Atualizar" : "Salvar" }}
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
export default {
  name: 'DashboardProdutos',
  
  data() {
    return {
      produtos: [
        { id: 1, nome: "Notebook", quantidade: 10, preco: 3500.00 },
        { id: 2, nome: "Mouse", quantidade: 5, preco: 80.00 }
      ],

      showForm: false,
      editando: false,
      showConfirmModal: false,
      produtoParaRemover: null,

      form: {
        id: null,
        nome: "",
        quantidade: 0,
        preco: 0
      }
    }
  },

  methods: {
    abrirForm() {
      this.resetForm()
      this.showForm = true
    },

    fecharForm() {
      this.showForm = false
      this.resetForm()
    },

    salvar() {
      // Validações
      if (!this.form.nome || this.form.nome.trim() === '') {
        alert('Por favor, informe o nome do produto')
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

      // Formata o nome (capitaliza primeira letra)
      const nomeFormatado = this.form.nome.trim().charAt(0).toUpperCase() + 
                           this.form.nome.trim().slice(1).toLowerCase()

      if (this.editando) {
        const index = this.produtos.findIndex(p => p.id === this.form.id)
        if (index !== -1) {
          this.produtos[index] = { 
            ...this.form, 
            nome: nomeFormatado,
            preco: parseFloat(this.form.preco)
          }
        }
      } else {
        // Verifica se já existe produto com mesmo nome
        const produtoExistente = this.produtos.find(p => 
          p.nome.toLowerCase() === nomeFormatado.toLowerCase()
        )
        
        if (produtoExistente) {
          alert('Já existe um produto com este nome!')
          return
        }
        
        this.produtos.push({
          ...this.form,
          id: Date.now(),
          nome: nomeFormatado,
          preco: parseFloat(this.form.preco)
        })
      }

      this.fecharForm()
    },

    editar(produto) {
      this.form = { 
        ...produto,
        preco: parseFloat(produto.preco)
      }
      this.editando = true
      this.showForm = true
    },

    confirmarRemover(produto) {
      this.produtoParaRemover = produto
      this.showConfirmModal = true
    },

    removerConfirmado() {
      if (this.produtoParaRemover) {
        this.remover(this.produtoParaRemover.id)
      }
      this.fecharConfirmModal()
    },

    remover(id) {
      this.produtos = this.produtos.filter(p => p.id !== id)
    },

    fecharConfirmModal() {
      this.showConfirmModal = false
      this.produtoParaRemover = null
    },

    resetForm() {
      this.form = {
        id: null,
        nome: "",
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
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

/* HEADER */
.header h1 {
  font-size: 28px;
  color: var(--azul-escuro, #2c3e50);
  margin-bottom: 5px;
}

.subtitle {
  color: #666;
  font-size: 14px;
}

/* ACTIONS */
.actions {
  display: flex;
  justify-content: flex-end;
}

/* BOTÕES */
.btn-primary {
  background: var(--azul-padrao, #42b983);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: var(--azul-padrao-escuro, #359268);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.btn-cancel {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background: #5a6268;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-danger:hover {
  background: #c82333;
}

/* BOX */
.box {
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
  border: 1px solid #e9ecef;
}

.box h3 {
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 18px;
}

/* LISTA */
.item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  align-items: center;
  transition: background 0.2s ease;
}

.item:last-child {
  border-bottom: none;
}

.header-item {
  font-weight: bold;
  color: #495057;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 10px;
}

/* Estados vazios */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
  font-size: 14px;
}

/* AÇÕES */
.acoes {
  display: flex;
  gap: 8px;
}

.edit, .delete {
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.edit {
  background: #ffc107;
  color: #212529;
  border: none;
}

.edit:hover {
  background: #e0a800;
  transform: scale(1.05);
}

.delete {
  background: #dc3545;
  color: white;
  border: none;
}

.delete:hover {
  background: #c82333;
  transform: scale(1.05);
}

/* MODAL */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 25px;
  border-radius: 15px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  animation: modalSlideIn 0.3s ease;
}

.confirm-modal {
  max-width: 350px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #dc3545;
}

/* Formulário */
.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #495057;
  font-weight: 500;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/* Animações */
@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsividade */
@media (max-width: 768px) {
  .dashboard {
    padding: 15px;
  }
  
  .item {
    grid-template-columns: 1fr;
    gap: 8px;
    text-align: center;
  }
  
  .header-item {
    display: none;
  }
  
  .acoes {
    justify-content: center;
  }
  
  .modal-content {
    margin: 20px;
    width: calc(100% - 40px);
  }
}
</style>