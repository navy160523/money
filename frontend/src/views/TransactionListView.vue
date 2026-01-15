<template>
  <div class="transaction-view animate-fade-in">
    <header class="view-header">
      <h1>Transactions</h1>
      <button @click="showModal = true" class="btn btn-primary">
        + Add New
      </button>
    </header>

    <div class="glass-card table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Category</th>
            <th>Amount</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tx in sortedTransactions" :key="tx.id">
            <td>{{ formatDate(tx.date) }}</td>
            <td>
              <span :class="tx.type === 'plus' ? 'badge-plus' : 'badge-minus'">
                {{ tx.type === 'plus' ? 'Income' : 'Expense' }}
              </span>
            </td>
            <td>{{ tx.category || '-' }}</td>
            <td :class="tx.type === 'plus' ? 'text-income' : 'text-expense'">
              {{ tx.type === 'plus' ? '+' : '-' }}{{ formatMoney(tx.amountValue || tx.amount) }}
            </td>
            <td class="text-right">
              <div class="actions">
                <button @click="editTx(tx)" class="btn-icon">✏️</button>
                <button @click="deleteTx(tx.id)" class="btn-icon">🗑️</button>
              </div>
            </td>
          </tr>
          <tr v-if="transactions.length === 0">
            <td colspan="5" class="empty-state">No transactions yet.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Simple Modal for Add/Edit -->
    <div v-if="showModal" class="modal-overlay">
      <div class="glass-card modal-content">
        <h3>{{ editingId ? 'Edit' : 'Add' }} Transaction</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>Type</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="form.type" value="plus" />
                <span class="radio-chip plus">+ Income</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="form.type" value="minus" />
                <span class="radio-chip minus">- Expense</span>
              </label>
            </div>
          </div>
          <div class="form-group">
            <label>Amount</label>
            <input type="number" v-model="form.amount" class="input-field" placeholder="0" />
          </div>
          <div class="form-group">
            <label>Category (C/S)</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="form.category" value="C" />
                <span class="radio-chip">C</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="form.category" value="S" />
                <span class="radio-chip">S</span>
              </label>
            </div>
          </div>
          <div class="form-group">
            <label>Date</label>
            <input type="date" v-model="form.date" class="input-field" />
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeModal" class="btn">Cancel</button>
          <button @click="saveTx" class="btn btn-primary">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'
import { db } from '../firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore'

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
    console.error('Firestore Error:', err)
  }
}

onMounted(fetchTransactions)

const showModal = ref(false)
const editingId = ref(null)
const form = ref({
  type: 'plus',
  amount: 0,
  category: 'C',
  date: dayjs().format('YYYY-MM-DD')
})

const sortedTransactions = computed(() => {
  return [...transactions.value].sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix())
})

const formatDate = (date) => dayjs(date).format('YYYY-MM-DD')
const formatMoney = (val) => new Intl.NumberFormat('ko-KR').format(val)

const closeModal = () => {
  showModal.value = false
  editingId.value = null
  form.value = {
    type: 'plus',
    amount: 0,
    category: 'C',
    date: dayjs().format('YYYY-MM-DD')
  }
}

const saveTx = async () => {
  const existingTx = editingId.value ? transactions.value.find(t => t.id === editingId.value) : null
  const timestamp = existingTx ? existingTx.no : dayjs().format('YYYYMMDDHHmmss')
  
  const payload = {
    no: timestamp,
    amount: form.value.amount.toString(),
    amountValue: Number(form.value.amount),
    type: form.value.type,
    category: form.value.category,
    date: dayjs(form.value.date).toISOString()
  }
  
  try {
    if (editingId.value) {
      const docRef = doc(db, 'transactions', editingId.value)
      await updateDoc(docRef, payload)
    } else {
      await addDoc(collection(db, 'transactions'), payload)
    }
    await fetchTransactions()
    
    Swal.fire({
      icon: 'success',
      title: '저장 완료',
      timer: 1000,
      showConfirmButton: false,
      background: 'var(--bg-card)',
      color: 'var(--text-main)'
    })
  } catch (err) {
    console.error('Firestore Save Error:', err)
  }
  closeModal()
}

const editTx = (tx) => {
  editingId.value = tx.id
  form.value = {
    ...tx,
    date: dayjs(tx.date).format('YYYY-MM-DD')
  }
  showModal.value = true
}

const deleteTx = async (id) => {
  const result = await Swal.fire({
    title: '정말 삭제하시겠습니까?',
    text: "이 작업은 되돌릴 수 없습니다.",
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
      await fetchTransactions()
      Swal.fire({
        title: '삭제 완료',
        icon: 'success',
        timer: 1000,
        showConfirmButton: false,
        background: 'var(--bg-card)',
        color: 'var(--text-main)'
      })
    } catch (err) {
      console.error('Firestore Delete Error:', err)
    }
  }
}
</script>

<style scoped>
/* ... existing styles ... */
.transaction-view {
  max-width: 1000px;
  margin: 0 auto;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.table-container {
  padding: 20px;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 15px;
  color: var(--text-muted);
  font-size: 0.9rem;
  border-bottom: 1px solid var(--glass-border);
}

.data-table td {
  padding: 15px;
  border-bottom: 1px solid var(--glass-border);
}

.text-right { text-align: right !important; }

.badge-plus, .badge-minus {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-plus { background: rgba(52, 211, 153, 0.1); color: var(--income); }
.badge-minus { background: rgba(251, 113, 133, 0.1); color: var(--expense); }

.text-income { color: var(--income); }
.text-expense { color: var(--expense); }

.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  transition: transform 0.2s;
}

.btn-icon:hover { transform: scale(1.2); }

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  max-width: 500px;
  padding: 30px;
}

.modal-content h3 { margin-bottom: 25px; }

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.modal-actions {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

@media (max-width: 720px) {
  .view-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .modal-content {
    padding: 20px;
    margin: 10px;
  }
  .data-table th, .data-table td {
    padding: 10px;
    font-size: 0.85rem;
  }
}
</style>
