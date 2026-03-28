<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo">Estoque</div>
      <h2>Login</h2>
      
      <form @submit.prevent="fazerLogin">
        <div class="form-group">
          <label>Usuário</label>
          <input 
            v-model="credenciais.username" 
            type="text" 
            placeholder="Digite seu usuário"
            required
          />
        </div>
        
        <div class="form-group">
          <label>Senha</label>
          <input 
            v-model="credenciais.password" 
            type="password" 
            placeholder="Digite sua senha"
            required
          />
        </div>
        
        <button type="submit" class="btn-login" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
        
        <div v-if="erro" class="error-message">
          {{ erro }}
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { authService } from '../services/api'

export default {
  data() {
    return {
      credenciais: {
        username: '',
        password: ''
      },
      loading: false,
      erro: ''
    }
  },
  
  methods: {
    async fazerLogin() {
      this.loading = true
      this.erro = ''
      
      try {
        const response = await authService.login(this.credenciais)
        const { token, usuario } = response.data
        
        localStorage.setItem('token', token)
        localStorage.setItem('usuario', JSON.stringify(usuario))
        
        this.$router.push('/')
      } catch (error) {
        this.erro = error.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f1f5f9;
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
}

/* CARD */
.login-card {
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* LOGO */
.logo {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  color: #2563eb;
  margin-bottom: 10px;
}

/* TITLE */
.login-card h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #1e293b;
  font-weight: 600;
}

/* FORM */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.form-group label {
  font-size: 13px;
  color: #475569;
  font-weight: 500;
}

/* INPUT */
.form-group input {
  width: 100%;
  padding: 11px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  background: #f8fafc;
  transition: 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* BUTTON */
.btn-login {
  width: 100%;
  padding: 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  margin-top: 10px;
}

.btn-login:hover {
  background: #2563eb;
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ERROR */
.error-message {
  margin-top: 10px;
  padding: 10px;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 10px;
  text-align: center;
  font-size: 13px;
}

/* ANIMAÇÃO */
.login-card {
  animation: fadeIn 0.25s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>