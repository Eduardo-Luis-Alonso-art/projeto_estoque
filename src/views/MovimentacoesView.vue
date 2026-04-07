<template>
<div class="movimentacoes-container">
<!-- HEADER -->
<div class="header">
    <h1>Movimentações de Estoque</h1>
    <span class="subtitle">Registre entradas e saídas de produtos</span>
</div>

<!-- FORMULÁRIO DE REGISTRO -->
<div class="form-card">
    <h3>Registrar Movimentação</h3>
    
    <form @submit.prevent="registrarMovimentacao" class="mov-form">
    <div class="form-row">
        <div class="form-group">
        <label>Produto *</label>
        <select v-model="novaMovimentacao.produto_id" required>
            <option value="">Selecione um produto</option>
            <option v-for="produto in produtos" :key="produto.id" :value="produto.id">
            {{ produto.nome }} (Estoque: {{ produto.quantidade }})
            </option>
        </select>
        </div>

        <div class="form-group">
        <label>Tipo *</label>
        <select v-model="novaMovimentacao.tipo" required>
            <option value="">Selecione o tipo</option>
            <option value="entrada">Entrada (adicionar ao estoque)</option>
            <option value="saida">Saída (remover do estoque)</option>
        </select>
        </div>

        <div class="form-group">
        <label>Quantidade *</label>
        <input 
            type="number" 
            v-model.number="novaMovimentacao.quantidade" 
            min="1"
            required
            placeholder="Quantidade"
        />
        </div>

        <div class="form-group">
        <label>&nbsp;</label>
        <button type="submit" class="btn-primary" :disabled="salvando">
            {{ salvando ? 'Registrando...' : 'Registrar Movimentação' }}
        </button>
        </div>
    </div>
    </form>
</div>

<!-- HISTÓRICO DE MOVIMENTAÇÕES -->
<div class="historico-card">
    <div class="card-header">
    <h3>Histórico de Movimentações</h3>
    <div class="filtros">
        <input 
        type="text" 
        v-model="filtroProduto" 
        placeholder="Filtrar por produto..."
        class="search-input"
        />
    </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
    Carregando movimentações...
    </div>

    <!-- Estado vazio -->
    <div v-else-if="movimentacoesFiltradas.length === 0" class="empty-state">
    Nenhuma movimentação registrada ainda.
    </div>

    <!-- Tabela -->
    <div v-else class="tabela">
    <div class="tabela-header">
        <span>Produto</span>
        <span>Tipo</span>
        <span>Quantidade</span>
        <span>Data/Hora</span>
        <span v-if="isAdmin">Ações</span>
    </div>

    <div v-for="mov in movimentacoesFiltradas" :key="mov.id" class="tabela-linha">
        <span class="produto-nome">{{ mov.produto_nome || 'Produto não encontrado' }}</span>
        <span>
        <span :class="['badge', mov.tipo]">
            {{ mov.tipo === 'entrada' ? 'ENTRADA' : 'SAÍDA' }}
        </span>
        </span>
        <span class="quantidade">{{ mov.quantidade }}</span>
        <span>{{ formatarData(mov.data) }}</span>
        <span v-if="isAdmin">
        <button @click="confirmarExclusao(mov)" class="btn-delete" title="Excluir movimentação">
            🗑️
        </button>
        </span>
    </div>
    </div>
</div>

<!-- MODAL DE CONFIRMAÇÃO -->
<div v-if="showConfirmModal" class="modal" @click.self="fecharConfirmModal">
    <div class="modal-content">
    <h3>Confirmar exclusão</h3>
    <p>Tem certeza que deseja excluir esta movimentação?</p>
    <p><strong>Produto:</strong> {{ movimentacaoParaExcluir?.produto_nome }}</p>
    <p><strong>Tipo:</strong> {{ movimentacaoParaExcluir?.tipo }}</p>
    <p><strong>Quantidade:</strong> {{ movimentacaoParaExcluir?.quantidade }}</p>
    
    <div class="modal-actions">
        <button class="btn-cancel" @click="fecharConfirmModal">Cancelar</button>
        <button class="btn-danger" @click="excluirMovimentacao">Confirmar Exclusão</button>
    </div>
    </div>
</div>
</div>
</template>

<script>
import { produtoService, movimentacaoService, authService } from '../services/api'

export default {
name: 'MovimentacoesView',

data() {
return {
    produtos: [],
    movimentacoes: [],
    loading: false,
    salvando: false,
    filtroProduto: '',
    
    novaMovimentacao: {
    produto_id: '',
    tipo: '',
    quantidade: 1
    },
    
    showConfirmModal: false,
    movimentacaoParaExcluir: null
}
},

computed: {
isAdmin() {
    return authService.isAdmin()
},

movimentacoesFiltradas() {
    if (!this.filtroProduto) {
    return this.movimentacoes
    }
    
    const termo = this.filtroProduto.toLowerCase()
    return this.movimentacoes.filter(mov => 
    mov.produto_nome && mov.produto_nome.toLowerCase().includes(termo)
    )
}
},

mounted() {
this.carregarDados()
},

methods: {
async carregarDados() {
    await Promise.all([
    this.carregarProdutos(),
    this.carregarMovimentacoes()
    ])
},

async carregarProdutos() {
    try {
    const response = await produtoService.listar()
    this.produtos = response.data
    } catch (error) {
    console.error('Erro ao carregar produtos:', error)
    alert('Erro ao carregar produtos. Verifique se o servidor está rodando.')
    }
},

async carregarMovimentacoes() {
    this.loading = true
    try {
    const response = await movimentacaoService.listar()
    // Ordenar por data decrescente (mais recentes primeiro)
    this.movimentacoes = response.data.sort((a, b) => 
        new Date(b.data) - new Date(a.data)
    )
    } catch (error) {
    console.error('Erro ao carregar movimentações:', error)
    alert('Erro ao carregar histórico de movimentações.')
    } finally {
    this.loading = false
    }
},

async registrarMovimentacao() {
    // Validações
    if (!this.novaMovimentacao.produto_id) {
    alert('Selecione um produto')
    return
    }
    
    if (!this.novaMovimentacao.tipo) {
    alert('Selecione o tipo de movimentação')
    return
    }
    
    if (this.novaMovimentacao.quantidade < 1) {
    alert('A quantidade deve ser maior que zero')
    return
    }

    // Verificar se tem estoque suficiente para saída
    const produtoSelecionado = this.produtos.find(p => p.id === this.novaMovimentacao.produto_id)
    if (this.novaMovimentacao.tipo === 'saida' && produtoSelecionado.quantidade < this.novaMovimentacao.quantidade) {
    alert(`Estoque insuficiente! Disponível: ${produtoSelecionado.quantidade} unidades`)
    return
    }

    this.salvando = true

    try {
    const movimentacaoData = {
        produto_id: this.novaMovimentacao.produto_id,
        tipo: this.novaMovimentacao.tipo,
        quantidade: this.novaMovimentacao.quantidade,
        data: new Date().toISOString()
    }

    await movimentacaoService.criar(movimentacaoData)
    
    // Resetar formulário
    this.novaMovimentacao = {
        produto_id: '',
        tipo: '',
        quantidade: 1
    }
    
    // Recarregar dados
    await this.carregarDados()
    
    alert('Movimentação registrada com sucesso!')
    
    } catch (error) {
    console.error('Erro ao registrar movimentação:', error)
    alert(error.response?.data?.message || 'Erro ao registrar movimentação.')
    } finally {
    this.salvando = false
    }
},

confirmarExclusao(movimentacao) {
    this.movimentacaoParaExcluir = movimentacao
    this.showConfirmModal = true
},

async excluirMovimentacao() {
    if (this.movimentacaoParaExcluir) {
    try {
        await movimentacaoService.deletar(this.movimentacaoParaExcluir.id)
        await this.carregarMovimentacoes()
        alert('Movimentação excluída com sucesso!')
    } catch (error) {
        console.error('Erro ao excluir movimentação:', error)
        alert(error.response?.data?.message || 'Erro ao excluir movimentação.')
    }
    }
    this.fecharConfirmModal()
},

fecharConfirmModal() {
    this.showConfirmModal = false
    this.movimentacaoParaExcluir = null
},

formatarData(data) {
    if (!data) return ''
    const d = new Date(data)
    return d.toLocaleString('pt-BR')
}
}
}
</script>

<style scoped>
.movimentacoes-container {
display: flex;
flex-direction: column;
gap: 24px;
}

.header h1 {
font-size: 28px;
font-weight: 700;
color: #1e293b;
}

.subtitle {
color: #64748b;
font-size: 14px;
}

/* FORM CARD */
.form-card {
background: white;
border-radius: 16px;
padding: 24px;
box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
}

.form-card h3 {
margin-bottom: 20px;
color: #1e293b;
}

.mov-form {
width: 100%;
}

.form-row {
display: grid;
grid-template-columns: 1fr 1fr 1fr 0.8fr;
gap: 16px;
align-items: end;
}

.form-group {
display: flex;
flex-direction: column;
gap: 8px;
}

.form-group label {
font-size: 13px;
font-weight: 500;
color: #475569;
}

.form-group input,
.form-group select {
padding: 10px;
border-radius: 10px;
border: 1px solid #e2e8f0;
font-size: 14px;
background: #f8fafc;
}

.form-group input:focus,
.form-group select:focus {
outline: none;
border-color: #3b82f6;
box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* HISTÓRICO CARD */
.historico-card {
background: white;
border-radius: 16px;
padding: 24px;
box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
}

.card-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 20px;
flex-wrap: wrap;
gap: 16px;
}

.card-header h3 {
color: #1e293b;
}

.search-input {
padding: 8px 12px;
border-radius: 10px;
border: 1px solid #e2e8f0;
width: 250px;
}

/* TABELA */
.tabela {
margin-top: 16px;
}

.tabela-header {
display: grid;
grid-template-columns: 2fr 1fr 0.8fr 1.5fr 0.8fr;
padding: 12px;
background: #f8fafc;
font-weight: 600;
color: #475569;
border-radius: 8px;
margin-bottom: 8px;
}

.tabela-linha {
display: grid;
grid-template-columns: 2fr 1fr 0.8fr 1.5fr 0.8fr;
padding: 12px;
border-bottom: 1px solid #f1f5f9;
align-items: center;
}

.tabela-linha:hover {
background: #f8fafc;
}

.produto-nome {
font-weight: 500;
color: #0f172a;
}

/* BADGES */
.badge {
padding: 4px 12px;
border-radius: 20px;
font-size: 12px;
font-weight: 600;
}

.badge.entrada {
background: #dcfce7;
color: #166534;
}

.badge.saida {
background: #fee2e2;
color: #991b1b;
}

.quantidade {
font-weight: 500;
}

/* BOTÕES */
.btn-primary {
background: #3b82f6;
color: white;
border: none;
padding: 10px 20px;
border-radius: 10px;
font-weight: 600;
cursor: pointer;
transition: 0.2s;
width: 100%;
}

.btn-primary:hover {
background: #2563eb;
}

.btn-primary:disabled {
opacity: 0.6;
cursor: not-allowed;
}

.btn-delete {
background: #fee2e2;
border: none;
padding: 6px 10px;
border-radius: 8px;
cursor: pointer;
transition: 0.2s;
}

.btn-delete:hover {
background: #fecaca;
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
max-width: 450px;
}

.modal-actions {
display: flex;
justify-content: flex-end;
gap: 12px;
margin-top: 20px;
}

.btn-cancel {
background: #e2e8f0;
border: none;
padding: 10px 20px;
border-radius: 8px;
cursor: pointer;
}

.btn-danger {
background: #ef4444;
color: white;
border: none;
padding: 10px 20px;
border-radius: 8px;
cursor: pointer;
}

/* STATES */
.loading-state,
.empty-state {
text-align: center;
padding: 40px;
color: #94a3b8;
}

@media (max-width: 1024px) {
.form-row {
grid-template-columns: 1fr;
}

.tabela-header,
.tabela-linha {
grid-template-columns: 1.5fr 0.8fr 0.5fr 1fr 0.5fr;
font-size: 12px;
}
}
</style>