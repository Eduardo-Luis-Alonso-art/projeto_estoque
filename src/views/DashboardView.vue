<template>
  <div class="dashboard">

    <!-- HEADER -->
    <div class="header">
      <h1>Dashboard</h1>
      <span class="subtitle">Visão geral do sistema</span>
    </div>

    <!-- CARDS -->
    <div class="cards">

      <div class="card blue">
        <div class="card-top">
          <span>Total de Produtos</span>
        </div>
        <h2>{{ totalProdutos }}</h2>
      </div>

      <div class="card">
        <div class="card-top">
          <span>Total em Estoque</span>
        </div>
        <h2>{{ totalEstoque }}</h2>
      </div>

      <div class="card red">
        <div class="card-top">
          <span>Estoque Baixo</span>
        </div>
        <h2>{{ estoqueBaixo.length }}</h2>
      </div>

    </div>

    <!-- GRID INFERIOR -->
    <div class="grid">

      <div class="box">
        <h3>Produtos com estoque baixo (≤ 5)</h3>

        <div v-if="loading" class="empty">Carregando...</div>
        <div v-else-if="estoqueBaixo.length === 0" class="empty">
          Tudo certo por aqui
        </div>

        <div v-for="p in estoqueBaixo" :key="p.id" class="item">
          <span>{{ p.nome }}</span>
          <span class="qtd">{{ p.quantidade }} unidades</span>
        </div>
      </div>

      <!-- MOVIMENTAÇÕES -->
      <div class="box">
        <h3>Últimas movimentações</h3>

        <div v-if="loadingMov" class="empty">Carregando...</div>
        <div v-else-if="movimentacoes.length === 0" class="empty">
          Nenhuma movimentação registrada
        </div>

        <div class="item header-mov" v-else>
          <span>Produto</span>
          <span>Tipo</span>
          <span>Qtd</span>
          <span>Data</span>
        </div>

        <div v-for="m in movimentacoes.slice(0, 5)" :key="m.id" class="item">
          <span>{{ m.produto_nome || m.produto_id }}</span>
          <span :class="m.tipo" class="tipo-badge">{{ m.tipo }}</span>
          <span>{{ m.quantidade }}</span>
          <span>{{ formatarData(m.data) }}</span>
        </div>
      </div>

    </div>

  </div>
</template>

<script>
import { produtoService, movimentacaoService } from '../services/api'

export default {
  data() {
    return {
      produtos: [],
      movimentacoes: [],
      loading: false,
      loadingMov: false
    }
  },

  computed: {
    totalProdutos() {
      return this.produtos.length
    },

    totalEstoque() {
      return this.produtos.reduce((total, p) => total + p.quantidade, 0)
    },

    estoqueBaixo() {
      return this.produtos.filter(p => p.quantidade <= 5)
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
      this.loading = true
      try {
        const response = await produtoService.listar()
        this.produtos = response.data
      } catch (error) {
        console.error('Erro ao carregar produtos:', error)
      } finally {
        this.loading = false
      }
    },

    async carregarMovimentacoes() {
      this.loadingMov = true
      try {
        const response = await movimentacaoService.listar()
        this.movimentacoes = response.data
      } catch (error) {
        console.error('Erro ao carregar movimentações:', error)
      } finally {
        this.loadingMov = false
      }
    },

    formatarData(data) {
      if (!data) return ''
      const d = new Date(data)
      return d.toLocaleDateString('pt-BR')
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
.header {
  display: flex;
  flex-direction: column;
  gap: 4px;
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

/* CARDS */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.card {
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.08);
}

.card-top {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #64748b;
}

.card h2 {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
}

/* VARIAÇÕES */
.card.blue {
  border-left: 5px solid #3b82f6;
}

.card.red {
  border-left: 5px solid #ef4444;
}

/* GRID INFERIOR */
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* BOXES */
.box {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
}

.box h3 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

/* ITENS */
.item {
  display: grid;
  grid-template-columns: 2fr 1fr;
  padding: 10px 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
}

.item:last-child {
  border-bottom: none;
}

/* MOVIMENTAÇÕES */
.grid .item {
  grid-template-columns: 2fr 1fr 0.8fr 1.2fr;
  gap: 10px;
  align-items: center;
}

/* HEADER DA TABELA */
.header-mov {
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 8px;
  margin-bottom: 5px;
  color: #475569;
}

/* BADGES */
.tipo-badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  width: fit-content;
}

.tipo-badge.entrada {
  background: #dcfce7;
  color: #166534;
}

.tipo-badge.saida {
  background: #fee2e2;
  color: #991b1b;
}

/* QUANTIDADE */
.qtd {
  font-weight: 500;
  color: #475569;
}

/* ESTADOS */
.empty {
  text-align: center;
  padding: 20px;
  color: #94a3b8;
  font-size: 14px;
}
</style>