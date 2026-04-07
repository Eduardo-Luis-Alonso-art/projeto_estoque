<template>
  <div class="layout">
    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="logo">
        Estoque
      </div>

      <nav class="nav-menu">
        <router-link to="/" class="nav-link" exact-active-class="router-link-active">
          <span class="icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
              <path fill="white"
                d="M23.949 13c-.509 6.158-5.66 11-11.949 11-6.627 0-12-5.373-12-12 0-6.29 4.842-11.44 11-11.95v12.95h12.949zm-10.949-2h10.949c-.481-5.828-5.122-10.467-10.949-10.95v10.95z" />
            </svg></span>
          Dashboard
        </router-link>

        <router-link to="/produtos" class="nav-link">
          <span class="icon"><svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd"
              clip-rule="evenodd">
              <path fill="white"
                d="M7 16.462l1.526-.723c1.792-.81 2.851-.344 4.349.232 1.716.661 2.365.883 3.077 1.164 1.278.506.688 2.177-.592 1.838-.778-.206-2.812-.795-3.38-.931-.64-.154-.93.602-.323.818 1.106.393 2.663.79 3.494 1.007.831.218 1.295-.145 1.881-.611.906-.72 2.968-2.909 2.968-2.909.842-.799 1.991-.135 1.991.72 0 .23-.083.474-.276.707-2.328 2.793-3.06 3.642-4.568 5.226-.623.655-1.342.974-2.204.974-.442 0-.922-.084-1.443-.25-1.825-.581-4.172-1.313-6.5-1.6v-5.662zm-1 6.538h-4v-8h4v8zm15-11.497l-6.5 3.468v-7.215l6.5-3.345v7.092zm-7.5-3.771v7.216l-6.458-3.445v-7.133l6.458 3.362zm-3.408-5.589l6.526 3.398-2.596 1.336-6.451-3.359 2.521-1.375zm10.381 1.415l-2.766 1.423-6.558-3.415 2.872-1.566 6.452 3.558z" />
            </svg></span>
          Produtos
        </router-link>

        <router-link to="/movimentacoes" class="nav-link">
          <span class="icon"><svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd"
              clip-rule="evenodd">
              <path fill="white"
                d="M18 6h-4v-2h4v2zm0 6h-4v-2h4v2zm-8-8h-4v2h4v-2zm0 6h-4v2h4v-2zm10-12h-20v20h20v-20zm-18 18v-16h16v16h-16z" />
            </svg></span> Movimentações
        </router-link>

        <router-link to="/relatorios" class="nav-link">
          <span class="icon"><svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd"
              clip-rule="evenodd">
              <path fill="white"
                d="M19 3h-14c-1.104 0-2 .896-2 2v14c0 1.104.896 2 2 2h14c1.104 0 2-.896 2-2v-14c0-1.104-.896-2-2-2zm-12 16h-2v-10h2v10zm4 0h-2v-6h2v6zm4 0h-2v-2h2v2zm0-14h-10v2h10v-2z" />
            </svg></span>
          Relatórios
        </router-link>
      </nav>

      <div class="sidebar-bottom">
        <div class="user-info">
          <div class="avatar"><span><svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd"
                clip-rule="evenodd">
                <path fill="white"
                  d="M12 0c6.623 0 12 5.377 12 12s-5.377 12-12 12-12-5.377-12-12 5.377-12 12-12zm8.127 19.41c-.282-.401-.772-.654-1.624-.85-3.848-.906-4.097-1.501-4.352-2.059-.259-.565-.19-1.23.205-1.977 1.726-3.257 2.09-6.024 1.027-7.79-.674-1.119-1.875-1.734-3.383-1.734-1.521 0-2.732.626-3.409 1.763-1.066 1.789-.693 4.544 1.049 7.757.402.742.476 1.406.22 1.974-.265.586-.611 1.19-4.365 2.066-.852.196-1.342.449-1.623.848 2.012 2.207 4.91 3.592 8.128 3.592s6.115-1.385 8.127-3.59zm.65-.782c1.395-1.844 2.223-4.14 2.223-6.628 0-6.071-4.929-11-11-11s-11 4.929-11 11c0 2.487.827 4.783 2.222 6.626.409-.452 1.049-.81 2.049-1.041 2.025-.462 3.376-.836 3.678-1.502.122-.272.061-.628-.188-1.087-1.917-3.535-2.282-6.641-1.03-8.745.853-1.431 2.408-2.251 4.269-2.251 1.845 0 3.391.808 4.24 2.218 1.251 2.079.896 5.195-1 8.774-.245.463-.304.821-.179 1.094.305.668 1.644 1.038 3.667 1.499 1 .23 1.64.59 2.049 1.043z" />
              </svg></span></div>
          <div class="user-text">
            <div class="name">Eduardo</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- ÁREA PRINCIPAL -->
    <div class="main">
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style>
/* RESET GLOBAL */
html,
body,
#app {
  margin: 0 !important;
  padding: 0 !important;
  height: 100% !important;
  width: 100% !important;
  overflow: hidden !important;
  background: #f8fafc;
}

* {
  box-sizing: border-box;
}

h1,
h2,
h3,
p,
div {
  margin: 0;
}
</style>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: #f8fafc;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* SIDEBAR */
.sidebar {
  width: 260px;
  background: #0f172a;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  padding: 32px 0;
  box-shadow: 3px 0 12px rgba(0, 0, 0, 0.18);
  flex-shrink: 0;
}

.logo {
  font-size: 28px;
  font-weight: 700;
  color: white;
  padding: 0 28px 48px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo-icon {
  font-size: 34px;
}

.nav-menu {
  flex: 1;
  padding: 0 16px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  margin: 6px 12px;
  color: #cbd5e1;
  text-decoration: none;
  border-radius: 12px;
  font-size: 15.5px;
  font-weight: 500;
  transition: all 0.25s ease;
}

.nav-link:hover {
  background: #1e2937;
  color: white;
  transform: translateX(6px);
}

.nav-link.router-link-active {
  background: #2563eb;
  color: white;
  font-weight: 600;
}

/* Rodapé da sidebar */
.sidebar-bottom {
  padding: 24px 28px 20px;
  border-top: 1px solid #1e2937;
  margin-top: auto;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.avatar {
  width: 42px;
  height: 42px;
  background: #334155;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 19px;
}

.user-text .name {
  font-weight: 600;
  font-size: 14.5px;
  color: white;
}

.user-text .role {
  font-size: 12.5px;
  color: #94a3b8;
}

/* MAIN + CONTENT */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  background: #f8fafc;
}

/* Scroll só no conteúdo */
.content::-webkit-scrollbar {
  width: 7px;
}

.content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 20px;
}

.content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>