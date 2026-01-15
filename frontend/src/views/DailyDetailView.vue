<template>
  <div class="daily-detail-view animate-fade-in">
    <header class="view-header">
      <div class="header-left">
        <button @click="router.back()" class="btn-back">← Back</button>
        <h1>Details for {{ formattedDate }}</h1>
      </div>
      <div class="header-stats">
        <div class="mini-stat">
          <span class="label">Daily Balance</span>
          <span :class="dailyBalance >= 0 ? 'text-income' : 'text-expense'" class="value">
            {{ dailyBalance >= 0 ? '+' : '' }}{{ formatMoney(dailyBalance) }}
          </span>
        </div>
      </div>
    </header>

    <div class="glass-card detail-container">
      <div v-if="loading" class="loading">Loading transactions...</div>
      <div v-else-if="dailyTransactions.length === 0" class="empty-state">
        No transactions recorded for this day.
      </div>
      <div v-else class="transaction-list">
        <div v-for="tx in dailyTransactions" :key="tx.id" class="tx-item glass-card">
          <div class="tx-info">
            <span class="tx-category">{{ tx.category || 'No Category' }}</span>
            <span class="tx-id">ID: {{ tx.no }}</span>
          </div>
          <div class="tx-amount-section">
            <span :class="tx.type === 'plus' ? 'text-income' : 'text-expense'" class="tx-amount">
              {{ tx.type === 'plus' ? '+' : '-' }}{{ formatMoney(tx.amountValue || tx.amount) }}
            </span>
            <div class="tx-actions">
              <button @click="deleteTx(tx.id)" class="btn-delete">🗑️</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'
import { db } from '../firebase'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'

const route = useRoute()
const router = useRouter()
const transactions = ref([])
const loading = ref(true)

const selectedDateStr = route.params.date // YYYY-MM-DD
const formattedDate = computed(() => dayjs(selectedDateStr).format('MMMM D, YYYY'))

const fetchDailyTransactions = async () => {
  loading.value = true
  try {
    const q = collection(db, 'transactions')
    const querySnapshot = await getDocs(q)
    const list = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (dayjs(data.date).format('YYYY-MM-DD') === selectedDateStr) {
        list.push({ id: doc.id, ...data })
      }
    })
    transactions.value = list
  } catch (err) {
    console.error('Fetch Error:', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchDailyTransactions)

const dailyTransactions = computed(() => {
  return [...transactions.value].sort((a, b) => b.no.localeCompare(a.no))
})

const dailyBalance = computed(() => {
  return transactions.value.reduce((sum, tx) => {
    const val = Number(tx.amountValue || tx.amount)
    return tx.type === 'plus' ? sum + val : sum - val
  }, 0)
})

const formatMoney = (val) => new Intl.NumberFormat('ko-KR').format(Math.abs(val))

const deleteTx = async (id) => {
  const result = await Swal.fire({
    title: '정말 삭제하시겠습니까?',
    text: "삭제된 내역은 복구할 수 없습니다!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#f43f5e',
    cancelButtonColor: '#94a3b8',
    confirmButtonText: '삭제',
    cancelButtonText: '취소',
    background: 'var(--bg-card)',
    color: 'var(--text-main)'
  })

  if (result.isConfirmed) {
    try {
      await deleteDoc(doc(db, 'transactions', id))
      await fetchDailyTransactions()
      Swal.fire({
        title: '삭제 완료!',
        icon: 'success',
        timer: 1000,
        showConfirmButton: false,
        background: 'var(--bg-card)',
        color: 'var(--text-main)'
      })
    } catch (err) {
      console.error('Delete Error:', err)
      Swal.fire({
        title: '오류 발생',
        text: '삭제 중 문제가 발생했습니다.',
        icon: 'error',
        background: 'var(--bg-card)',
        color: 'var(--text-main)'
      })
    }
  }
}
</script>

<style scoped>
.daily-detail-view {
  max-width: 800px;
  margin: 0 auto;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.btn-back {
  background: var(--glass);
  border: 1px solid var(--glass-border);
  color: var(--text-main);
  padding: 8px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}

.header-stats {
  text-align: right;
}

.mini-stat .label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.mini-stat .value {
  font-size: 1.4rem;
  font-weight: 700;
}

.detail-container {
  padding: 30px;
  min-height: 400px;
}

.loading, .empty-state {
  text-align: center;
  padding: 50px;
  color: var(--text-muted);
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.tx-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
}

.tx-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.tx-category {
  font-weight: 700;
  font-size: 1.1rem;
}

.tx-id {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.tx-amount-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.tx-amount {
  font-size: 1.2rem;
  font-weight: 700;
}

.btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  transition: transform 0.2s;
}

.btn-delete:hover {
  transform: scale(1.2);
}

.text-income { color: var(--income); }
.text-expense { color: var(--expense); }

@media (max-width: 600px) {
  .view-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
  .header-stats {
    text-align: left;
  }
}
</style>
