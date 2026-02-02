<template>
  <div class="fcm-view animate-fade-in">
    <header class="view-header">
      <h1>FCM Notifications</h1>
      <div class="header-actions">
        <button v-if="!currentToken" @click="requestPermission" class="btn btn-secondary mr-2">
          🔔 Enable Push
        </button>
        <button @click="openAddModal" class="btn btn-primary">
          + Create Notification
        </button>
      </div>
    </header>

    <div class="glass-card table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Body</th>
            <th>Created At</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="note in notifications" :key="note.id">
            <td class="font-bold">{{ note.title }}</td>
            <td class="text-muted text-sm truncate-text">{{ note.body }}</td>
            <td>{{ formatDate(note.createdAt) }}</td>
            <td class="text-right">
              <div class="actions">
                <button @click="editNote(note)" class="btn-icon" title="Edit">✏️</button>
                <button @click="deleteNote(note.id)" class="btn-icon" title="Delete">🗑️</button>
                <button @click="sendNotification(note)" class="btn-icon" title="Send Push">🚀</button>
              </div>
            </td>
          </tr>
          <tr v-if="notifications.length === 0">
            <td colspan="4" class="empty-state">No notifications registered.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal for Add/Edit -->
    <div v-if="showModal" class="modal-overlay">
      <div class="glass-card modal-content">
        <h3>{{ editingId ? 'Edit' : 'Create' }} Notification</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>Title</label>
            <input type="text" v-model="form.title" class="input-field" placeholder="Notification Title" />
          </div>
          <div class="form-group">
            <label>Body</label>
            <textarea v-model="form.body" class="input-field" rows="4" placeholder="Notification Message Body"></textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeModal" class="btn">Cancel</button>
          <button @click="saveNote" class="btn btn-primary">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'
import { db, messaging } from '../firebase'
import { getToken, onMessage } from 'firebase/messaging'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore'

const notifications = ref([])
const showModal = ref(false)
const editingId = ref(null)
const currentToken = ref(localStorage.getItem('fcm_token') || '')
const form = ref({
  title: '',
  body: ''
})

// Request permission and get token
const requestPermission = async () => {
  try {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      // Register service worker explicitly
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
      
      const token = await getToken(messaging, {
        vapidKey: 'BB6Hob3R5L1-0K4bsPZpiTQ4RnnqvBM_NbcIT6ynqXuYIVxeZgmnMGQK4ZmecCv76w6fLw5f3j28PAge4SDCQMY',
        serviceWorkerRegistration: registration
      })
      if (token) {
        currentToken.value = token
        localStorage.setItem('fcm_token', token)
        Swal.fire('Success', 'Push notifications enabled!', 'success')
      }
    } else {
      Swal.fire('Permission Denied', 'You need to allow notifications to receive push messages.', 'warning')
    }
  } catch (err) {
    console.error('FCM Token Error Details:', err)
    Swal.fire('Error', `Failed to enable push notifications: ${err.message}`, 'error')
  }
}

// Handle foreground messages
onMessage(messaging, (payload) => {
  console.log('Foreground message received:', payload)
  Swal.fire({
    title: payload.notification.title,
    text: payload.notification.body,
    icon: 'info',
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
  })
})

const fetchNotifications = async () => {
  try {
    const q = query(collection(db, 'fcm_notifications'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    const list = []
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() })
    })
    notifications.value = list
  } catch (err) {
    console.error('Firestore Error:', err)
  }
}

onMounted(fetchNotifications)

const formatDate = (ts) => {
  if (!ts) return '-'
  const date = ts.toDate ? ts.toDate() : ts
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const openAddModal = () => {
  editingId.value = null
  form.value = { title: '', body: '' }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingId.value = null
  form.value = { title: '', body: '' }
}

const saveNote = async () => {
  if (!form.value.title || !form.value.body) {
    Swal.fire({
      icon: 'error',
      title: 'Validation Error',
      text: 'Please fill in both title and body.'
    })
    return
  }

  try {
    const payload = {
      title: form.value.title,
      body: form.value.body,
      updatedAt: serverTimestamp()
    }

    if (editingId.value) {
      const docRef = doc(db, 'fcm_notifications', editingId.value)
      await updateDoc(docRef, payload)
    } else {
      payload.createdAt = serverTimestamp()
      await addDoc(collection(db, 'fcm_notifications'), payload)
    }

    await fetchNotifications()
    closeModal()
    
    Swal.fire({
      icon: 'success',
      title: 'Saved Successfully',
      timer: 1500,
      showConfirmButton: false,
      background: 'var(--bg-card)',
      color: 'var(--text-main)'
    })
  } catch (err) {
    console.error('Firestore Save Error:', err)
  }
}

const editNote = (note) => {
  editingId.value = note.id
  form.value = { title: note.title, body: note.body }
  showModal.value = true
}

const deleteNote = async (id) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "This will delete the notification template.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#f43f5e',
    cancelButtonColor: '#94a3b8',
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    background: 'var(--bg-card)',
    color: 'var(--text-main)'
  })

  if (result.isConfirmed) {
    try {
      await deleteDoc(doc(db, 'fcm_notifications', id))
      await fetchNotifications()
      Swal.fire({
        title: 'Deleted',
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

const sendNotification = async (note) => {
  const result = await Swal.fire({
    title: 'Send Notification?',
    text: `Send to: ${currentToken.value ? 'Current Device Only' : 'Broadcast (All Devices)'}`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Send Now',
    cancelButtonText: 'Cancel'
  })

  if (result.isConfirmed) {
    try {
      // Calling backend API
      const response = await fetch('http://localhost:8080/api/fcm/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: currentToken.value,
          title: note.title,
          body: note.body
        })
      })
      
      const data = await response.json()
      console.log('Send response:', data)

      Swal.fire('Sent!', 'Notification sent successfully.', 'success')
    } catch (err) {
      console.error('Send Error:', err)
      Swal.fire('Error', 'Failed to send notification. Is the backend running?', 'error')
    }
  }
}

</script>

<style scoped>
.fcm-view {
  max-width: 1000px;
  margin: 0 auto;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mr-2 { margin-right: 8px; }

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

.actions {
  display: flex;
  gap: 15px;
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

.truncate-text {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
</style>
