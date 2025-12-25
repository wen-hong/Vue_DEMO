<script setup>
import { ref, onMounted, computed } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import api from '@/services/api'

/* ------------------ state ------------------ */
const events = ref([])

const categories = [
  { label: '工作', value: 'work' },
  { label: '個人', value: 'personal' },
  { label: '家庭', value: 'family' },
  { label: '其他', value: 'other' },
]

const modalData = ref({
  id: null,
  title: '',
  description: '',
  event_date: '',
  category: '',
})

let bsModal = null

/* ------------------ methods ------------------ */
const loadEvents = async () => {
  const categoryColorMap = {
    work: '#0d6efd',
    personal: '#198754',
    family: '#fd7e14',
    other: '#6c757d',
  }

  try {
    const res = await api.get('/calendar')
    events.value = res.data.map((e) => ({
      id: e.id,
      title: e.title,
      start: e.event_date,
      allDay: true,
      backgroundColor: categoryColorMap[e.category] || '#6c757d',
      borderColor: categoryColorMap[e.category] || '#6c757d',
      extendedProps: {
        description: e.description,
        category: e.category,
      },
    }))
  } catch (err) {
    console.error('載入事件失敗', err)
    alert('載入行事曆資料失敗')
  }
}

const handleDateClick = (info) => {
  if (!bsModal) return

  modalData.value = {
    id: null,
    title: '',
    description: '',
    event_date: info.dateStr,
    category: '',
  }

  bsModal.show()
}

const handleEventClick = (info) => {
  if (!bsModal) return

  modalData.value = {
    id: info.event.id,
    title: info.event.title,
    description: info.event.extendedProps.description || '',
    event_date: info.event.startStr,
    category: info.event.extendedProps.category || 'other',
  }

  bsModal.show()
}

const saveEvent = async () => {
  if (!modalData.value.title || !modalData.value.event_date) {
    alert('請填寫事件名稱與日期')
    return
  }

  if (!modalData.value.category) {
    modalData.value.category = 'other'
  }

  try {
    if (modalData.value.id) {
      await api.put(`/calendar/${modalData.value.id}`, modalData.value)
    } else {
      await api.post('/calendar', modalData.value)
    }

    bsModal.hide()
    await loadEvents()
  } catch (err) {
    console.error('儲存失敗', err)
    alert('儲存事件失敗')
  }
}

const deleteEvent = async () => {
  if (!modalData.value.id) return

  if (!confirm('確定要刪除此事件？')) return

  try {
    await api.delete(`/calendar/${modalData.value.id}`)
    bsModal.hide()
    await loadEvents()
  } catch (err) {
    console.error('刪除失敗', err)
    alert('刪除事件失敗')
  }
}

/* ------------------ calendar options ------------------ */
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  events: events.value,
  dateClick: handleDateClick,
  eventClick: handleEventClick,
  eventDidMount(info) {
    info.el.title = '點擊可編輯 / 刪除事件'
  },
}))

/* ------------------ lifecycle ------------------ */
onMounted(() => {
  loadEvents()

  const modalEl = document.getElementById('calendarModal')
  if (modalEl) {
    bsModal = new window.bootstrap.Modal(modalEl, {
      backdrop: true,
      focus: true,
    })
  }
})
</script>

<template>
  <FullCalendar :options="calendarOptions" />

  <!-- Bootstrap Modal -->
  <div
    class="modal fade"
    id="calendarModal"
    tabindex="-1"
    aria-labelledby="calendarModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="calendarModalLabel">
            {{ modalData.id ? '編輯事件' : '新增事件' }}
          </h5>
          <button type="button" class="btn-close" @click="bsModal.hide()" />
        </div>

        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">事件名稱</label>
            <input class="form-control" v-model="modalData.title" />
          </div>

          <div class="mb-3">
            <label class="form-label">描述</label>
            <textarea class="form-control" rows="3" v-model="modalData.description" />
          </div>

          <div class="mb-3">
            <label class="form-label">日期</label>
            <input type="date" class="form-control" v-model="modalData.event_date" />
          </div>

          <div class="mb-3">
            <label class="form-label">分類</label>
            <select class="form-select" v-model="modalData.category">
              <option disabled value="">請選擇分類</option>
              <option v-for="c in categories" :key="c.value" :value="c.value">
                {{ c.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-primary" @click="saveEvent">儲存</button>
          <button v-if="modalData.id" class="btn btn-danger" @click="deleteEvent">刪除</button>
          <button class="btn btn-secondary" @click="bsModal.hide()">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>
