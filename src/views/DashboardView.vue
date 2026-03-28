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
          <span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M17.677 16.879l-.343.195v-1.717l.343-.195v1.717zm2.823-3.324l-.342.195v1.717l.342-.196v-1.716zm3.5-7.602v11.507l-9.75 5.54-10.25-4.989v-11.507l9.767-5.504 10.233 4.953zm-11.846-1.757l7.022 3.2 1.7-.917-7.113-3.193-1.609.91zm.846 7.703l-7-3.24v8.19l7 3.148v-8.098zm3.021-2.809l-6.818-3.24-2.045 1.168 6.859 3.161 2.004-1.089zm5.979-.943l-2 1.078v2.786l-3 1.688v-2.856l-2 1.078v8.362l7-3.985v-8.151zm-4.907 7.348l-.349.199v1.713l.349-.195v-1.717zm1.405-.8l-.344.196v1.717l.344-.196v-1.717zm.574-.327l-.343.195v1.717l.343-.195v-1.717zm.584-.332l-.35.199v1.717l.35-.199v-1.717zm-16.656-4.036h-2v1h2v-1zm0 2h-3v1h3v-1zm0 2h-2v1h2v-1z"/></svg></span>
        </div>
        <h2>{{ totalProdutos }}</h2>
      </div>

      <div class="card">
        <div class="card-top">
          <span>Total em Estoque</span>
          <span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M5 19h-4v-4h4v4zm6 0h-4v-8h4v8zm6 0h-4v-13h4v13zm6 0h-4v-19h4v19zm1 2h-24v2h24v-2z"/></svg></span>
        </div>
        <h2>{{ totalEstoque }}</h2>
      </div>

      <div class="card red">
        <div class="card-top">
          <span>Estoque Baixo</span>
          <span><svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M14.139 2.63l3.068-1.441.786 3.297 3.39.032-.722 3.312 3.038 1.5-2.087 2.671 2.087 2.67-3.038 1.499.722 3.312-3.39.033-.786 3.296-3.068-1.441-2.139 2.63-2.138-2.63-3.068 1.441-.787-3.296-3.389-.033.722-3.312-3.039-1.499 2.088-2.67-2.088-2.671 3.039-1.5-.722-3.312 3.389-.032.787-3.297 3.068 1.441 2.138-2.63 2.139 2.63zm-3.742 2.342l-2.303-1.081-.59 2.474-2.542.024.542 2.483-2.279 1.125 1.566 2.004-1.566 2.002 2.279 1.124-.542 2.485 2.542.025.59 2.472 2.303-1.081 1.603 1.972 1.604-1.972 2.301 1.081.59-2.472 2.543-.025-.542-2.485 2.279-1.124-1.565-2.002 1.565-2.004-2.279-1.125.542-2.483-2.543-.024-.59-2.474-2.301 1.081-1.604-1.972-1.603 1.972zm1.603 9.528c.69 0 1.25.56 1.25 1.25s-.56 1.25-1.25 1.25-1.25-.56-1.25-1.25.56-1.25 1.25-1.25zm1-.947h-2v-6.553h2v6.553z"/></svg></span>
        </div>
        <h2>{{ estoqueBaixo.length }}</h2>
      </div>

    </div>

    <!-- GRID INFERIOR -->
    <div class="grid">

      <!-- ESTOQUE BAIXO -->
      <div class="box">
        <h3>Produtos com estoque baixo</h3>

        <div v-if="estoqueBaixo.length === 0" class="empty">
          Tudo certo por aqui
        </div>

        <div v-for="p in estoqueBaixo" :key="p.id" class="item">
          <span>{{ p.nome }}</span>
          <span class="qtd">{{ p.quantidade }}</span>
        </div>
      </div>

      <!-- MOVIMENTAÇÕES (mock) -->
      <div class="box">
        <h3>Últimas movimentações</h3>

        <div class="item" v-for="m in movimentacoes" :key="m.id">
          <span>{{ m.nome }}</span>
          <span :class="m.tipo">{{ m.tipo }}</span>
        </div>
      </div>

    </div>

  </div>
</template>

<script>
export default {
  data() {
    return {
      produtos: [
        { id: 1, nome: "Notebook", quantidade: 10 },
        { id: 2, nome: "Mouse", quantidade: 3 },
        { id: 3, nome: "Teclado", quantidade: 2 }
      ],

      movimentacoes: [
        { id: 1, nome: "Notebook", tipo: "entrada" },
        { id: 2, nome: "Mouse", tipo: "saida" }
      ]
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
  }
}
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* HEADER */
.header h1 {
  font-size: 28px;
  color: var(--azul-escuro);
}

.subtitle {
  color: #666;
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
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  transition: 0.3s;
}

.card:hover {
  transform: translateY(-5px);
}

.card-top {
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 14px;
}

.card h2 {
  margin-top: 10px;
  font-size: 30px;
  color: var(--azul-escuro);
}

/* VARIAÇÕES */
.card.blue {
  border-left: 5px solid var(--azul-padrao);
}

.card.red {
  border-left: 5px solid #ef4444;
}

/* GRID */
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* BOX */
.box {
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
}

.box h3 {
  margin-bottom: 15px;
  color: var(--azul-escuro);
}

/* ITEMS */
.item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.qtd {
  font-weight: bold;
  color: #ef4444;
}

.entrada {
  color: green;
}

.saida {
  color: red;
}

.empty {
  color: #999;
}
</style>