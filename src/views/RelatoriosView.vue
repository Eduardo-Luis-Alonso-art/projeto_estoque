<template>
<div class="relatorios-container">
<!-- HEADER -->
<div class="header">
    <h1>Relatórios</h1>
    <span class="subtitle">Análise de movimentações do estoque</span>
</div>

<!-- FILTROS -->
<div class="filtros-card">
    <h3>Filtros</h3>
    
    <div class="filtros-grid">
    <div class="form-group">
        <label>Produto</label>
        <select v-model="filtros.produto_id">
        <option value="">Todos os produtos</option>
        <option v-for="produto in produtos" :key="produto.id" :value="produto.id">
            {{ produto.nome }}
        </option>
        </select>
    </div>

    <div class="form-group">
        <label>Data Início</label>
        <input type="date" v-model="filtros.data_inicio" />
    </div>

    <div class="form-group">
        <label>Data Fim</label>
        <input type="date" v-model="filtros.data_fim" />
    </div>

    <div class="form-group">
        <label>&nbsp;</label>
        <button @click="aplicarFiltros" class="btn-primary">
        Aplicar Filtros
        </button>
    </div>
    </div>
</div>

<!-- RESUMO (APENAS PARA ADMIN) -->
<div v-if="isAdmin" class="resumo-card">
    <h3>Resumo do Período</h3>
    
    <div class="resumo-grid">
    <div class="resumo-item">
        <span class="resumo-label">Total de Movimentações</span>
        <span class="resumo-valor">{{ resumo.totalMovimentacoes }}</span>
    </div>
    
    <div class="resumo-item">
        <span class="resumo-label">Total de Entradas</span>
        <span class="resumo-valor positivo">{{ resumo.totalEntradas }}</span>
    </div>
    
    <div class="resumo-item">
        <span class="resumo-label">Total de Saídas</span>
        <span class="resumo-valor negativo">{{ resumo.totalSaidas }}</span>
    </div>
    
    <div class="resumo-item">
        <span class="resumo-label">Quantidade Total Entrada</span>
        <span class="resumo-valor">{{ resumo.qtdTotalEntradas }}</span>
    </div>
    
    <div class="resumo-item">
        <span class="resumo-label">Quantidade Total Saída</span>
        <span class="resumo-valor">{{ resumo.qtdTotalSaidas }}</span>
    </div>
    
    <div class="resumo-item">
        <span class="resumo-label">Saldo no Período</span>
        <span :class="['resumo-valor', resumo.saldo >= 0 ? 'positivo' : 'negativo']">
        {{ resumo.saldo >= 0 ? '+' : '' }}{{ resumo.saldo }}
        </span>
    </div>
    </div>
</div>

<!-- LISTA DE MOVIMENTAÇÕES FILTRADAS -->
<div class="historico-card">
    <div class="card-header">
    <h3>Movimentações Filtradas</h3>
    <div class="acoes">
        <span class="total-registros">{{ movimentacoesFiltradas.length }} registros encontrados</span>
        <button v-if="movimentacoesFiltradas.length > 0" @click="exportarCSV" class="btn-export">
        Exportar CSV
        </button>
    </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
    Carregando movimentações...
    </div>

    <!-- Estado vazio -->
    <div v-else-if="movimentacoesFiltradas.length === 0" class="empty-state">
    Nenhuma movimentação encontrada para os filtros selecionados.
    </div>

    <!-- Tabela -->
    <div v-else class="tabela">
    <div class="tabela-header">
        <span>Data/Hora</span>
        <span>Produto</span>
        <span>Tipo</span>
        <span>Quantidade</span>
        <span v-if="isAdmin">Valor Unitário</span>
        <span v-if="isAdmin">Valor Total</span>
    </div>

    <div v-for="mov in movimentacoesFiltradas" :key="mov.id" class="tabela-linha">
        <span>{{ formatarDataCompleta(mov.data) }}</span>
        <span class="produto-nome">{{ mov.produto_nome || 'Produto não encontrado' }}</span>
        <span>
        <span :class="['badge', mov.tipo]">
            {{ mov.tipo === 'entrada' ? 'ENTRADA' : 'SAÍDA' }}
        </span>
        </span>
        <span class="quantidade">{{ mov.quantidade }}</span>
        <span v-if="isAdmin">{{ formatarMoeda(mov.produto_preco) }}</span>
        <span v-if="isAdmin">{{ formatarMoeda(mov.quantidade * mov.produto_preco) }}</span>
    </div>
    </div>
</div>
</div>
</template>

<script>
import { produtoService, movimentacaoService, authService } from '../services/api'

export default {
name: 'RelatoriosView',

data() {
return {
    produtos: [],
    movimentacoes: [],
    movimentacoesFiltradas: [],
    loading: false,
    
    filtros: {
    produto_id: '',
    data_inicio: '',
    data_fim: ''
    },
    
    resumo: {
    totalMovimentacoes: 0,
    totalEntradas: 0,
    totalSaidas: 0,
    qtdTotalEntradas: 0,
    qtdTotalSaidas: 0,
    saldo: 0
    }
}
},

computed: {
isAdmin() {
    return authService.isAdmin()
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
    }
},

async carregarMovimentacoes() {
    this.loading = true
    try {
    const response = await movimentacaoService.listar()
    this.movimentacoes = response.data.sort((a, b) => 
        new Date(b.data) - new Date(a.data)
    )
    this.aplicarFiltros()
    } catch (error) {
    console.error('Erro ao carregar movimentações:', error)
    alert('Erro ao carregar movimentações.')
    } finally {
    this.loading = false
    }
},

aplicarFiltros() {
    let filtradas = [...this.movimentacoes]
    
    // Filtro por produto
    if (this.filtros.produto_id) {
    filtradas = filtradas.filter(mov => mov.produto_id === this.filtros.produto_id)
    }
    
    // Filtro por data início
    if (this.filtros.data_inicio) {
    const dataInicio = new Date(this.filtros.data_inicio)
    filtradas = filtradas.filter(mov => new Date(mov.data) >= dataInicio)
    }
    
    // Filtro por data fim
    if (this.filtros.data_fim) {
    const dataFim = new Date(this.filtros.data_fim)
    dataFim.setHours(23, 59, 59)
    filtradas = filtradas.filter(mov => new Date(mov.data) <= dataFim)
    }
    
    this.movimentacoesFiltradas = filtradas
    
    // Calcular resumo (apenas se for admin)
    if (this.isAdmin) {
    this.calcularResumo()
    }
},

calcularResumo() {
    const entradas = this.movimentacoesFiltradas.filter(m => m.tipo === 'entrada')
    const saidas = this.movimentacoesFiltradas.filter(m => m.tipo === 'saida')
    
    this.resumo.totalMovimentacoes = this.movimentacoesFiltradas.length
    this.resumo.totalEntradas = entradas.length
    this.resumo.totalSaidas = saidas.length
    this.resumo.qtdTotalEntradas = entradas.reduce((sum, m) => sum + m.quantidade, 0)
    this.resumo.qtdTotalSaidas = saidas.reduce((sum, m) => sum + m.quantidade, 0)
    this.resumo.saldo = this.resumo.qtdTotalEntradas - this.resumo.qtdTotalSaidas
},

exportarCSV() {
    if (this.movimentacoesFiltradas.length === 0) {
    alert('Não há dados para exportar')
    return
    }
    
    // Cabeçalhos do CSV
    let csvContent = "Data,Tipo,Produto,Quantidade"
    
    if (this.isAdmin) {
    csvContent += ",Valor Unitário,Valor Total"
    }
    
    csvContent += "\n"
    
    // Dados
    this.movimentacoesFiltradas.forEach(mov => {
    const linha = [
        this.formatarDataCompleta(mov.data),
        mov.tipo === 'entrada' ? 'ENTRADA' : 'SAÍDA',
        mov.produto_nome || 'Produto não encontrado',
        mov.quantidade
    ]
    
    if (this.isAdmin) {
        linha.push(this.formatarMoeda(mov.produto_preco))
        linha.push(this.formatarMoeda(mov.quantidade * mov.produto_preco))
    }
    
    csvContent += linha.join(',') + "\n"
    })
    
    // Download do arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `relatorio_estoque_${new Date().toISOString().slice(0,10)}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
},

formatarDataCompleta(data) {
    if (!data) return ''
    const d = new Date(data)
    return d.toLocaleString('pt-BR')
},

formatarMoeda(valor) {
    if (typeof valor !== 'number') return 'R$ 0,00'
    return `R$ ${valor.toFixed(2).replace('.', ',')}`
}
}
}
</script>

<style scoped>
.relatorios-container {
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

/* FILTROS CARD */
.filtros-card {
background: white;
border-radius: 16px;
padding: 24px;
box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
}

.filtros-card h3 {
margin-bottom: 20px;
color: #1e293b;
}

.filtros-grid {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

/* RESUMO CARD */
.resumo-card {
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
border-radius: 16px;
padding: 24px;
color: white;
}

.resumo-card h3 {
margin-bottom: 20px;
color: white;
}

.resumo-grid {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
gap: 20px;
}

.resumo-item {
background: rgba(255, 255, 255, 0.1);
padding: 16px;
border-radius: 12px;
text-align: center;
}

.resumo-label {
display: block;
font-size: 13px;
opacity: 0.9;
margin-bottom: 8px;
}

.resumo-valor {
font-size: 28px;
font-weight: 700;
}

.resumo-valor.positivo {
color: #a0ffa0;
}

.resumo-valor.negativo {
color: #ffa0a0;
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

.total-registros {
font-size: 14px;
color: #64748b;
margin-right: 16px;
}

.btn-export {
background: #10b981;
color: white;
border: none;
padding: 8px 16px;
border-radius: 8px;
cursor: pointer;
font-size: 13px;
}

.btn-primary {
background: #3b82f6;
color: white;
border: none;
padding: 10px 20px;
border-radius: 10px;
font-weight: 600;
cursor: pointer;
transition: 0.2s;
}

.btn-primary:hover {
background: #2563eb;
}

/* TABELA */
.tabela {
margin-top: 16px;
overflow-x: auto;
}

.tabela-header {
display: grid;
grid-template-columns: 1.5fr 1.5fr 0.8fr 0.5fr;
padding: 12px;
background: #f8fafc;
font-weight: 600;
color: #475569;
border-radius: 8px;
margin-bottom: 8px;
}

.tabela-linha {
display: grid;
grid-template-columns: 1.5fr 1.5fr 0.8fr 0.5fr;
padding: 12px;
border-bottom: 1px solid #f1f5f9;
align-items: center;
}

/* Admin tem mais colunas */
.is-admin .tabela-header,
.is-admin .tabela-linha {
grid-template-columns: 1.5fr 1.5fr 0.8fr 0.5fr 0.8fr 0.8fr;
}

.tabela-linha:hover {
background: #f8fafc;
}

.produto-nome {
font-weight: 500;
color: #0f172a;
}

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

/* STATES */
.loading-state,
.empty-state {
text-align: center;
padding: 40px;
color: #94a3b8;
}

@media (max-width: 768px) {
.resumo-grid {
grid-template-columns: 1fr;
}

.tabela {
font-size: 12px;
}
}
</style>