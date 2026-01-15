<template>
  <div class="login-view">
    <div class="login-card glass-card animate-fade-in">
      <div class="lock-icon">🔒</div>
      <h1>System Locked</h1>
      <p>Please enter password to continue</p>
      
      <div class="input-group">
        <input 
          type="password" 
          v-model="password" 
          placeholder="Password" 
          class="input-field"
          @keyup.enter="handleUnlock"
        />
        <p v-if="error" class="error-text">{{ error }}</p>
      </div>
      
      <button @click="handleUnlock" class="btn btn-primary w-full justify-center">
        Unlock
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const password = ref('')
const error = ref('')
const router = useRouter()

const handleUnlock = () => {
  if (password.value === '123qwe!@#') {
    sessionStorage.setItem('isLocked', 'false')
    router.push({ name: 'dashboard' })
  } else {
    error.value = 'Invalid password'
    password.value = ''
  }
}
</script>

<style scoped>
.login-view {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 50px 40px;
  text-align: center;
}

.lock-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

h1 {
  font-size: 1.8rem;
  margin-bottom: 8px;
}

p {
  color: var(--text-muted);
  margin-bottom: 30px;
}

.input-group {
  margin-bottom: 25px;
  text-align: left;
}

.error-text {
  color: var(--accent);
  font-size: 0.8rem;
  margin-top: 5px;
  text-align: center;
}

.w-full { width: 100%; }
.justify-center { justify-content: center; }
</style>
