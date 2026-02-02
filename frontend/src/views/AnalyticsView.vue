<template>
  <div class="analytics-view animate-fade-in">
    <header class="view-header">
      <h1>Google Analytics</h1>
    </header>

    <div class="glass-card info-container">
      <div class="analytics-header">
        <div class="ga-logo">
          <img src="https://www.gstatic.com/analytics-suite/header/suite/analytics/logo_ga_64.png" alt="Google Analytics">
        </div>
        <h2>App performance & visitor insights</h2>
      </div>

      <p class="description">
        Google Analytics provides deep insights into how users find and use your application. 
        Track user engagement, session duration, bounce rates, and more to optimize your money management system.
      </p>

      <div class="action-section">
        <a href="https://analytics.google.com/" target="_blank" class="btn btn-primary ga-link">
          Go to Google Analytics Console ↗
        </a>
      </div>

      <div class="setup-guide">
        <h3>How to track this app?</h3>
        <ol class="steps">
          <li>Create a <strong>GA4 Property</strong> in the Google Analytics Console.</li>
          <li>Get your <strong>Measurement ID</strong> (e.g., <code>G-XXXXXXXXXX</code>).</li>
          <li>Add the script to your <code>index.html</code> (or we can automate it here).</li>
        </ol>
      </div>
      
      <div v-if="isLoaded" class="status-badge active">
        ✅ Tracking Active (ID: {{ trackingId }})
      </div>
      <div v-else class="status-badge inactive">
        ⚠️ Tracking not configured in this app yet.
      </div>
    </div>
    
    <!-- Integration with GA Data API could be implemented here as charts -->
    <div class="glass-card metrics-placeholder mt-4">
      <h3>Quick Metrics (Sample)</h3>
      <div class="metrics-grid">
        <div class="metric-card">
          <span class="label">Users</span>
          <span class="value">124</span>
          <span class="trend plus">+12%</span>
        </div>
        <div class="metric-card">
          <span class="label">Sessions</span>
          <span class="value">342</span>
          <span class="trend plus">+5%</span>
        </div>
        <div class="metric-card">
          <span class="label">Bounce Rate</span>
          <span class="value">42.3%</span>
          <span class="trend minus">-2%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { analytics } from '../firebase'

const trackingId = ref('G-LXCS4DDBMZ') // Using ID from config
const isLoaded = ref(false)

onMounted(() => {
  if (analytics) {
    isLoaded.value = true
  }
})
</script>

<style scoped>
.analytics-view {
  max-width: 1000px;
  margin: 0 auto;
}

.info-container {
  padding: 40px;
}

.analytics-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 25px;
}

.ga-logo img {
  height: 48px;
}

.description {
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 30px;
  font-size: 1.1rem;
}

.action-section {
  margin-bottom: 40px;
}

.ga-link {
  text-decoration: none;
  font-weight: 600;
  padding: 15px 30px;
}

.setup-guide {
  background: rgba(255, 255, 255, 0.05);
  padding: 25px;
  border-radius: 16px;
  border: 1px solid var(--glass-border);
}

.setup-guide h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.steps {
  padding-left: 20px;
  margin: 0;
}

.steps li {
  margin-bottom: 10px;
  color: var(--text-main);
}

.status-badge {
  margin-top: 25px;
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.status-badge.active {
  background: rgba(52, 211, 153, 0.15);
  color: #10b981;
}

.status-badge.inactive {
  background: rgba(244, 63, 94, 0.15);
  color: #f43f5e;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.metric-card {
  background: rgba(255, 255, 255, 0.03);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.metric-card .label {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.metric-card .value {
  font-size: 1.8rem;
  font-weight: 700;
}

.metric-card .trend {
  font-size: 0.8rem;
  font-weight: 600;
}

.trend.plus { color: #10b981; }
.trend.minus { color: #f43f5e; }

.mt-4 { margin-top: 2rem; }

@media (max-width: 720px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
