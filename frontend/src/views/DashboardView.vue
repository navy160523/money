<template>
  <div class="dashboard-view animate-fade-in">
    <header class="view-header">
      <div class="stats-row">
        <div class="stat-card glass-card">
          <span class="label">+ Income</span>
          <span class="value text-primary">+{{ formatMoney(totalIncome) }}</span>
        </div>
        <div class="stat-card glass-card">
          <span class="label">- Expense</span>
          <span class="value text-accent">-{{ formatMoney(totalExpense) }}</span>
        </div>
        <div class="stat-card glass-card">
          <span class="label">Sum</span>
          <span class="value text-primary">{{ formatMoney(totalIncome-totalExpense) }}</span>
        </div>
        <div class="stat-card glass-card">
          <span class="label">Year</span>
          <span class="value text-primary">{{ formatMoney(totalIncomeYear-totalExpenseYear) }}</span>
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
              <div v-if="getDayCategoryTotal(day, 'C') !== 0" 
                :class="getDayCategoryTotal(day, 'C') > 0 ? 'tiny-plus' : 'tiny-minus'"
              >
                C: {{ getDayCategoryTotal(day, 'C') > 0 ? '+' : '-' }}{{ formatShort(Math.abs(getDayCategoryTotal(day, 'C'))) }}
              </div>
              <div v-if="getDayCategoryTotal(day, 'S') !== 0" 
                :class="getDayCategoryTotal(day, 'S') > 0 ? 'tiny-plus' : 'tiny-minus'"
                style="margin-top: 2px; border: 1px dashed rgba(255,255,255,0.1)"
              >
                S: {{ getDayCategoryTotal(day, 'S') > 0 ? '+' : '-' }}{{ formatShort(Math.abs(getDayCategoryTotal(day, 'S'))) }}
              </div>
            </div>
            <div class="day-data-total" v-if="getDayTotal(day) !== 0"
              :class="getDayTotal(day) > 0 ? 'tiny-plus' : 'tiny-minus'"
            >
              {{ getDayTotal(day) > 0 ? '+' : '-' }}{{ formatShort(Math.abs(getDayTotal(day))) }}
            </div>
          </div>
        </div>
      </div>

      <div class="side-panel">
        <div class="quick-add glass-card">
          <h3>등록</h3>
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
                <input type="radio" v-model="quickForm.category" value="S" />
                <span class="radio-chip">S</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="quickForm.category" value="C" />
                <span class="radio-chip">C</span>
              </label>
            </div>
          </div>
          <div class="form-group">
            <label>Date</label>
            <input type="date" v-model="quickForm.date" class="input-field" />
          </div>
          <button @click="handleRegistration" class="btn btn-primary w-full justify-center">등록하기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import Swal from 'sweetalert2'
import { db } from '../firebase'
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore'

const router = useRouter()
const props = defineProps({
  handleLock: Function
})

const kstTime = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'))
const currentDate = ref(dayjs())
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const quickForm = ref({
  type: 'plus',
  amount: 0,
  category: 'S',
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

onMounted(() => {
  fetchTransactions()
  // Update time every second
  const interval = setInterval(() => {
    kstTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
  }, 1000)
  // Cleanup interval on unmount
  return () => clearInterval(interval)
})

const currentMonthName = computed(() => currentDate.value.locale('ko').format('YYYY년 M월'))
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
  if (val >= 10000) return Math.floor(val / 10000) + '만'
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
    quickForm.value.category = 'S'
    
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

const getDayCategoryTotal = (day, category) => {
  const dateStr = currentDate.value.date(day).format('YYYY-MM-DD')
  return transactions.value
    .filter(t => dayjs(t.date).format('YYYY-MM-DD') === dateStr && t.category === category)
    .reduce((sum, t) => {
      const val = (Number(t.amountValue) || 0)
      return t.type === 'plus' ? sum + val : sum - val
    }, 0)
}

const getDayTotal = (day) => {
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

const totalIncomeYear = computed(() => {
  return transactions.value
    .filter(t => t.type === 'plus' && dayjs(t.date).isSame(currentDate.value, 'year'))
    .reduce((sum, t) => sum + (Number(t.amountValue) || 0), 0)
})

const totalExpenseYear = computed(() => {
  return transactions.value
    .filter(t => t.type === 'minus' && dayjs(t.date).isSame(currentDate.value, 'year'))
    .reduce((sum, t) => sum + (Number(t.amountValue) || 0), 0)
})

const totalSumYear = computed(() => {
  return totalIncomeYear.value - totalExpenseYear.value
})

</script>

<style>
.dashboard-view {
  max-width: 1200px;
  margin: 0 auto;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-right: 0;
}

.date-info {
  color: var(--text-muted);
  margin-top: 5px;
}

.stats-row {
  display: flex;
  gap: 20px;
  align-items: center;
  width: 100%;
}

.stat-card {
  padding: 15px 25px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 75px;
  justify-content: center;
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
  .stats-row {
    width: 100%;
    flex-direction: column;   /* ✅ 1열로 */
    gap: 12px;
  }

  .stat-card {
    width: 100%;              /* ✅ 카드가 가로 꽉 차게 */
    min-width: 0;             /* ✅ 말줄임/overflow 동작 필수 */
  }

  .stat-card .value {
    font-size: 1.2rem;        /* ✅ 모바일에서 적당히 */
    line-height: 1.2;
    white-space: nowrap;      /* ✅ 한 줄 유지 */
    overflow: hidden;         /* ✅ 넘치면 숨김 */
    text-overflow: ellipsis;  /* ✅ ... 처리 */
    max-width: 100%;          /* ✅ 부모폭 기준 */
  }

  .stat-card .label {
    font-size: 0.75rem;
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
  display: none;
  flex-direction: column;
  gap: 4px;
}

.day-data-total {
  margin-top: 10px;
  display: flex;
  font-size: 0.75rem;
  padding: 3px 6px;
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
  display: flex;
  flex-direction: column;
  align-items: center;
}

.quick-add h3 {
  margin-bottom: 20px;
  align-self: flex-start;
  width: 100%;
}

.form-group {
  margin-bottom: 15px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.form-group label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 0;
  align-self: flex-start;
}

.w-full { width: 100%; }
.justify-center { justify-content: center; }

/* Media Queries - must come AFTER base styles */
/*
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
  */

@media (max-width: 480px) {
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

/* Fit calendar for small phones (<= 412px) */
@media (max-width: 412px) {
  .view-header {
    margin-bottom: 20px;
  }
  .view-header h1 {
    font-size: 1.3rem;
  }
  .date-info {
    font-size: 0.7rem;
  }
  .stat-card {
    padding: 10px 15px;
    flex: 1;
    min-height: auto;
  }
  .stat-card .label {
    font-size: 0.7rem;
  }
  .stat-card .value {
    font-size: 1.1rem;
  }
  .content-grid {
    gap: 15px;
  }
  .calendar-section {
    padding: 8px;
  }
  .calendar-header {
    margin-bottom: 15px;
  }
  .calendar-header h2 {
    font-size: 1rem;
  }
  .calendar-grid {
    grid-template-columns: repeat(7, 1fr);
    gap: 0.5px;
    width: 100%;
  }
  .day-name {
    padding: 6px 2px;
    font-size: 0.65rem;
  }
  .day-cell {
    min-height: 50px;
    padding: 4px;
  }
  .day-number {
    font-size: 0.72rem;
  }
  .day-data {
    margin-top: 4px;
    gap: 2px;
    display: none;
  }
  .day-data-total {
    margin-top: 4px;
    display: flex;
    font-size: 0.62rem;
    padding: 2px 3px;
  }
  .tiny-plus, .tiny-minus {
    font-size: 0.62rem;
    padding: 2px 3px;
  }
  .quick-add {
    padding: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .quick-add h3 {
    font-size: 0.95rem;
    margin-bottom: 0;
    width: 100%;
  }
  .quick-add .form-group:nth-of-type(2),
  .quick-add .form-group:nth-of-type(4) {
    width: 100%;
  }
  .form-group {
    margin-bottom: 0;
  }
  .form-group label {
    font-size: 0.7rem;
    margin-bottom: 5px;
    text-align: left;
  }
  .input-field {
    padding: 14px 12px;
    font-size: 0.95rem;
  }
  .radio-group {
    gap: 20px;
    padding: 12px 8px;
    justify-content: center;
    flex-wrap: nowrap;
    width: 100%;
  }
  .radio-chip {
    padding: 12px 18px;
    font-size: 0.85rem;
    min-width: 90px;
  }
  .btn {
    padding: 16px 24px;
    font-size: 1rem;
  }
}
</style>
