<template>
  <div class="dashboard-view animate-fade-in">
    <header class="view-header">
      <div>
        <h1>Dashboard</h1>
        <p class="date-info">{{ kstTime }} (KST)</p>
      </div>
      <div class="stats-row">
        <div class="stat-card glass-card">
          <span class="label">This Month Income</span>
          <span class="value text-primary">+{{ formatMoney(totalIncome) }}</span>
        </div>
        <div class="stat-card glass-card">
          <span class="label">This Month Expense</span>
          <span class="value text-accent">-{{ formatMoney(totalExpense) }}</span>
        </div>
      </div>
    </header>

    <div class="content-grid">
      <div class="calendar-section glass-card">
        <div class="calendar-header">
          <h2>{{ currentMonthName }}</h2>
          <div class="calendar-nav">
            <button @click="prevMonth">&lt;</button>
            <button @click="nextMonth">&gt;</button>
          </div>
        </div>
        <div class="calendar-grid">
          <div v-for="day in weekDays" :key="day" class="day-name">{{ day }}</div>
          <div v-for="empty in emptyDays" :key="'empty-'+empty" class="day-empty"></div>
          <div v-for="day in daysInMonth" :key="day" 
            class="day-cell" 
            :class="{ 
              'today': isToday(day),
              'selected': isSelected(day)
            }"
            @click="goToDetail(day)"
          >
            <div class="day-header">
              <span class="day-number">{{ day }}</span>
              <button @click.stop="selectDate(day)" class="btn-select-date" title="Select for Registration">📍</button>
            </div>
            <div class="day-data">
              <div v-if="getDayDailyBalance(day) !== 0" 
                :class="getDayDailyBalance(day) > 0 ? 'tiny-plus' : 'tiny-minus'"
              >
                {{ getDayDailyBalance(day) > 0 ? '+' : '-' }}{{ formatShort(Math.abs(getDayDailyBalance(day))) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="side-panel">
        <div class="quick-add glass-card">
          <h3>Quick Registration</h3>
          <div class="form-group">
            <label>Type</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="quickForm.type" value="plus" />
                <span class="radio-chip plus">+ Income</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="quickForm.type" value="minus" />
                <span class="radio-chip minus">- Expense</span>
              </label>
            </div>
          </div>
          <div class="form-group">
            <label>Amount</label>
            <input type="number" v-model="quickForm.amount" class="input-field" placeholder="0" />
          </div>
          <div class="form-group">
            <label>Category (C/S)</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="quickForm.category" value="C" />
                <span class="radio-chip">C</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="quickForm.category" value="S" />
                <span class="radio-chip">S</span>
              </label>
            </div>
          </div>
          <div class="form-group">
            <label>Date</label>
            <input type="date" v-model="quickForm.date" class="input-field" />
          </div>
          <button @click="handleRegistration" class="btn btn-primary w-full justify-center">Register</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'
import { db } from '../firebase'
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore'

const router = useRouter()

const kstTime = computed(() => dayjs().format('YYYY-MM-DD HH:mm:ss'))
const currentDate = ref(dayjs())
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const quickForm = ref({
  type: 'plus',
  amount: 0,
  category: 'C',
  date: dayjs().format('YYYY-MM-DD')
})

const transactions = ref([])

const fetchTransactions = async () => {
  try {
    const q = query(collection(db, 'transactions'), orderBy('date', 'desc'))
    const querySnapshot = await getDocs(q)
    const list = []
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() })
    })
    transactions.value = list
  } catch (err) {
    console.error('Firestore Fetch Error:', err)
  }
}

onMounted(fetchTransactions)

const currentMonthName = computed(() => currentDate.value.format('MMMM YYYY'))
const daysInMonth = computed(() => currentDate.value.daysInMonth())
const firstDayOfMonth = computed(() => currentDate.value.startOf('month').day())
const emptyDays = computed(() => Array.from({ length: firstDayOfMonth.value }, (_, i) => i))

const prevMonth = () => { currentDate.value = currentDate.value.subtract(1, 'month') }
const nextMonth = () => { currentDate.value = currentDate.value.add(1, 'month') }

const isToday = (day) => {
  return dayjs().isSame(currentDate.value.date(day), 'day')
}

const isSelected = (day) => {
  return dayjs(quickForm.value.date).isSame(currentDate.value.date(day), 'day')
}

const selectDate = (day) => {
  quickForm.value.date = currentDate.value.date(day).format('YYYY-MM-DD')
}

const goToDetail = (day) => {
  const dateStr = currentDate.value.date(day).format('YYYY-MM-DD')
  router.push({ name: 'daily-detail', params: { date: dateStr } })
}

const formatMoney = (val) => new Intl.NumberFormat('ko-KR').format(val)
const formatShort = (val) => {
  if (val >= 1000000) return (val/1000000).toFixed(1) + 'M'
  if (val >= 1000) return (val/1000).toFixed(1) + 'K'
  return val
}

const handleRegistration = async () => {
  if (!quickForm.value.amount || quickForm.value.amount <= 0) {
    Swal.fire({
      icon: 'warning',
      title: '입력 오류',
      text: '금액을 입력해주세요!',
      background: 'var(--bg-card)',
      color: 'var(--text-main)',
      confirmButtonColor: 'var(--primary)',
      backdrop: `rgba(0,0,0,0.4)`
    })
    return
  }
  
  const timestamp = dayjs().format('YYYYMMDDHHmmss')
  const newTx = {
    no: timestamp,
    amount: quickForm.value.amount.toString(),
    amountValue: Number(quickForm.value.amount),
    type: quickForm.value.type,
    category: quickForm.value.category,
    date: dayjs(quickForm.value.date).toISOString()
  }
  
  try {
    await addDoc(collection(db, 'transactions'), newTx)
    await fetchTransactions()
    quickForm.value.amount = 0
    quickForm.value.category = 'C'
    
    Swal.fire({
      icon: 'success',
      title: '등록 완료',
      timer: 1500,
      showConfirmButton: false,
      background: 'var(--bg-card)',
      color: 'var(--text-main)'
    })
  } catch (err) {
    console.error('Firestore Add Error:', err)
  }
}

const getDayDailyBalance = (day) => {
  const dateStr = currentDate.value.date(day).format('YYYY-MM-DD')
  return transactions.value
    .filter(t => dayjs(t.date).format('YYYY-MM-DD') === dateStr)
    .reduce((sum, t) => {
      const val = (Number(t.amountValue) || 0)
      return t.type === 'plus' ? sum + val : sum - val
    }, 0)
}

const totalIncome = computed(() => {
  return transactions.value
    .filter(t => t.type === 'plus' && dayjs(t.date).isSame(currentDate.value, 'month'))
    .reduce((sum, t) => sum + (Number(t.amountValue) || 0), 0)
})

const totalExpense = computed(() => {
  return transactions.value
    .filter(t => t.type === 'minus' && dayjs(t.date).isSame(currentDate.value, 'month'))
    .reduce((sum, t) => sum + (Number(t.amountValue) || 0), 0)
})
</script>

<style scoped>
.dashboard-view {
  max-width: 1200px;
  margin: 0 auto;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.date-info {
  color: var(--text-muted);
  margin-top: 5px;
}

.stats-row {
  display: flex;
  gap: 20px;
}

.stat-card {
  padding: 15px 25px;
  display: flex;
  flex-direction: column;
  min-width: 200px;
}

.stat-card .label {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.stat-card .value {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 5px;
}

.text-primary { color: var(--primary); }
.text-accent { color: var(--accent); }

.content-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 30px;
}

/* Breakpoints */
@media (max-width: 1080px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .view-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
  .stats-row {
    width: 100%;
  }
  .stat-card {
    flex: 1;
    min-width: 0;
  }
}

@media (max-width: 480px) {
  .stats-row {
    flex-direction: column;
  }
  .calendar-section {
    padding: 15px;
  }
  .day-cell {
    min-height: 70px;
    padding: 5px;
  }
  .day-number {
    font-size: 0.8rem;
  }
  .day-data {
    gap: 2px;
  }
  .tiny-plus, .tiny-minus {
    font-size: 0.6rem;
    padding: 1px 2px;
  }
}

.calendar-section {
  padding: 30px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.calendar-nav {
  display: flex;
  gap: 10px;
}

.calendar-nav button {
  background: var(--glass);
  border: 1px solid var(--glass-border);
  color: var(--text-main);
  padding: 5px 12px;
  border-radius: 8px;
  cursor: pointer;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: var(--glass-border);
  border: 1px solid var(--glass-border);
}

.day-name {
  background: var(--bg-dark);
  text-align: center;
  padding: 10px;
  font-weight: 600;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.day-cell {
  background: var(--bg-dark);
  min-height: 100px;
  padding: 10px;
  position: relative;
  cursor: pointer;
  transition: var(--transition);
}

.day-cell:hover {
  background: rgba(255, 255, 255, 0.03);
}

.day-cell.selected {
  border: 2px solid var(--primary);
  background: rgba(99, 102, 241, 0.05);
  border-radius: 12px;
  z-index: 1;
}

.day-cell.today {
  background: rgba(99, 102, 241, 0.05);
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-select-date {
  background: none;
  border: none;
  font-size: 0.8rem;
  cursor: pointer;
  opacity: 0.3;
  transition: opacity 0.2s;
}

.day-cell:hover .btn-select-date {
  opacity: 1;
}

.day-number {
  font-size: 0.9rem;
  font-weight: 600;
  color: #3b82f6; /* Bright Blue */
}

.day-data {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tiny-plus {
  font-size: 0.75rem;
  font-weight: 700;
  color: #059669; /* Darker Green for visibility */
  background: rgba(16, 185, 129, 0.15);
  padding: 3px 6px;
  border-radius: 6px;
  text-align: center;
}

.tiny-minus {
  font-size: 0.75rem;
  font-weight: 700;
  color: #dc2626; /* Darker Red for visibility */
  background: rgba(239, 68, 68, 0.15);
  padding: 3px 6px;
  border-radius: 6px;
  text-align: center;
}

.quick-add {
  padding: 25px;
}

.quick-add h3 {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 5px;
}

.w-full { width: 100%; }
.justify-center { justify-content: center; }
</style>
