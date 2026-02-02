<template>
  <div class="app-container">
    <!-- Mobile Header -->
    <header v-if="!isLocked" class="mobile-header">
      <div class="logo">
        <span class="logo-icon">💰</span>
        <span class="logo-text">Money</span>
      </div>
      <div class="header-buttons">
        <button @click="handleLock" class="btn-lock-mobile">
          🔒
        </button>
        <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="menu-toggle">
          {{ isMobileMenuOpen ? '✕' : '☰' }}
        </button>
      </div>
    </header>

    <!-- Sidebar Overlay -->
    <div v-if="isMobileMenuOpen" @click="isMobileMenuOpen = false" class="sidebar-overlay"></div>

    <nav v-if="!isLocked && isSidebarOpen" class="sidebar glass-card" :class="{ 'mobile-open': isMobileMenuOpen }">
      <div class="sidebar-top">
        <div class="logo">
          <span class="logo-icon">💰</span>
          <span class="logo-text">Money</span>
        </div>
        <div class="sidebar-controls">
          <button @click="toggleTheme" class="theme-toggle" :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
            {{ isDark ? '🌞' : '🌙' }}
          </button>
          <button @click="isMobileMenuOpen = false" class="mobile-close">✕</button>
        </div>
      </div>
      <div class="menu-items">
        <router-link to="/" class="menu-item" active-class="active" @click="isMobileMenuOpen = false">
          📊 Dashboard
        </router-link>
        <router-link to="/transactions" class="menu-item" active-class="active" @click="isMobileMenuOpen = false">
          📜 Transactions
        </router-link>
        <router-link to="/fcm" class="menu-item" active-class="active" @click="isMobileMenuOpen = false">
          📣 FCM
        </router-link>
        <router-link to="/analytics" class="menu-item" active-class="active" @click="isMobileMenuOpen = false">
          📊 Analytics
        </router-link>
      </div>
      <button @click="handleLock" class="btn-lock" title="Lock">
        🔒 Lock
      </button>
    </nav>

    <!-- Sidebar Toggle Button -->
    <button v-if="!isLocked" @click="toggleSidebar" class="sidebar-toggle" :title="isSidebarOpen ? 'Hide Menu' : 'Show Menu'">
      {{ isSidebarOpen ? '◀' : '▶' }}
    </button>

    <main class="main-content" :class="{ 'full-width': isLocked, 'sidebar-collapsed': !isSidebarOpen, 'sidebar-collapsed': !isSidebarOpen }">
      <router-view :handleLock="handleLock" />
    </main>
  </div>
</template>

<script setup>
import { computed, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const isDark = ref(false)
const isMobileMenuOpen = ref(false)
const isSidebarOpen = ref(true)

// Set initial theme to light
document.documentElement.setAttribute('data-theme', 'light')

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const isLocked = ref(sessionStorage.getItem('isLocked') !== 'false')

watch(() => route.path, () => {
  isLocked.value = sessionStorage.getItem('isLocked') !== 'false'
})

const handleLock = () => {
  sessionStorage.removeItem('isLocked')
  isLocked.value = true
  router.push({ name: 'login' })
}
</script>

<style>
.app-container {
  display: flex;
  min-height: 100vh;
}

/* Mobile Header */
.mobile-header {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--glass-border);
  z-index: 100;
  padding: 0 20px;
  justify-content: space-between;
  align-items: center;
}

.menu-toggle {
  background: none;
  border: none;
  color: var(--text-main);
  font-size: 1.5rem;
  cursor: pointer;
}

.header-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn-lock-mobile {
  background: rgba(244, 63, 94, 0.2);
  border: 1px solid var(--accent);
  color: var(--accent);
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  display: none;
}

.btn-lock-mobile:hover {
  background: rgba(244, 63, 94, 0.3);
}

.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 140;
}

.sidebar {
  width: 260px;
  height: calc(100vh - 40px);
  margin: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  position: fixed;
  z-index: 150;
  transition: transform 0.3s ease, left 0.3s ease;
}

.sidebar-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.mobile-close {
  display: none;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1.2rem;
  cursor: pointer;
}

.main-content {
  flex: 1;
  padding: 30px;
  margin-left: 300px;
  transition: all 0.3s ease;
}

.main-content.full-width {
  margin-left: 0;
  padding: 0;
}

.main-content.sidebar-collapsed {
  margin-left: 0;
}

.sidebar-toggle {
  position: fixed;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--glass);
  border: 1px solid var(--glass-border);
  color: var(--text-main);
  padding: 12px 8px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  z-index: 140;
  transition: all 0.3s ease;
}

.sidebar-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Breakpoint 1: 1080px (Desktop Large) */
@media (max-width: 1080px) {
  .sidebar {
    width: 240px;
  }
  .main-content {
    margin-left: 280px;
    padding: 25px;
  }
}

/* Breakpoint 2: 720px (Tablet/Small Laptop) */
@media (max-width: 720px) {
  .sidebar {
    width: 220px;
    margin: 10px;
    height: calc(100vh - 20px);
  }
  .main-content {
    margin-left: 240px;
  }
}

/* Breakpoint 3: 480px (Mobile) */
@media (max-width: 480px) {
  .app-container {
    flex-direction: column;
  }
  .mobile-header {
    display: flex;
  }
  .sidebar-overlay {
    display: block;
  }
  .sidebar {
    position: fixed;
    top: 0;
    left: -280px; /* Hidden by default */
    margin: 0;
    height: 100vh;
    border-radius: 0 24px 24px 0;
    width: 280px;
    transition: left 0.3s ease;
  }
  .sidebar.mobile-open {
    left: 0;
  }
  .mobile-close {
    display: block;
  }
  .main-content {
    margin-left: 0;
    padding: 90px 20px 20px 20px; /* Offset for mobile header */
  }
}

/* Breakpoint 4: 412px (Small phones like Galaxy S22) */
@media (max-width: 412px) {
  .mobile-header {
    height: 60px;
    padding: 0 15px;
  }
  .btn-lock-mobile {
    display: block;
  }
  .main-content {
    padding: 75px 12px 12px 12px;
  }
  .logo-text {
    font-size: 1.2rem;
  }
}

/* Existing styles preserved */
.sidebar-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.theme-toggle {
  background: var(--glass);
  border: 1px solid var(--glass-border);
  color: var(--text-main);
  padding: 8px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  transition: var(--transition);
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.menu-items {
  flex: 1;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 12px;
  color: var(--text-muted);
  text-decoration: none;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background: var(--glass);
  color: var(--text-main);
}

.menu-item.active {
  background: var(--primary-gradient);
  color: white;
}

.btn-lock {
  background: var(--glass);
  border: 1px solid var(--glass-border);
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  width: 100%;
  border-radius: 12px;
  transition: background 0.3s;
  margin-top: auto;
}

.btn-lock:hover {
  background: rgba(244, 63, 94, 0.1);
  color: var(--accent);
}

@media (max-width: 480px) {
  .btn-lock {
    display: none;
  }
}
</style>
