<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import api from '@/services/api'

Chart.register(...registerables)

/* ---------- 基本 ---------- */
const chartRef = ref(null)
let chartInstance = null
const loading = ref(false)
const rawStats = ref([])
const viewMode = ref('table') // table | bar | line

/* ---------- 分類 ---------- */
const categories = [
  { label: '全部', value: '' },
  { label: 'Work', value: 'work' },
  { label: 'Personal', value: 'personal' },
  { label: 'Family', value: 'family' },
  { label: 'Other', value: 'other' },
]

const chartCategories = categories.filter((c) => c.value)

const categoryColors = {
  work: '#0d6efd',
  personal: '#198754',
  family: '#fd7e14',
  other: '#6c757d',
}

/* ---------- 日期 ---------- */
const format = (d) => d.toISOString().slice(0, 10)
const today = new Date()

const uiFilters = ref({
  start_date: format(new Date(today.getTime() - 14 * 86400000)),
  end_date: format(new Date(today.getTime() + 14 * 86400000)),
  category: '',
})

const appliedFilters = ref({ ...uiFilters.value })

/* ---------- Computed ---------- */
const dates = computed(() =>
  [...new Set(rawStats.value.map((i) => i.date))].sort((a, b) => new Date(a) - new Date(b)),
)

const tableRows = computed(() =>
  dates.value.map((date) => {
    const row = { date, total: 0 }
    chartCategories.forEach((c) => {
      const found = rawStats.value.find((i) => i.date === date && i.category === c.value)
      const count = found ? found.count : 0
      row[c.value] = count
      row.total += count
    })
    return row
  }),
)

const hasData = computed(() => tableRows.value.length > 0)

const datasets = computed(() =>
  chartCategories.map((c) => ({
    label: c.label,
    data: dates.value.map((d) => {
      const found = rawStats.value.find((i) => i.date === d && i.category === c.value)
      return found ? found.count : 0
    }),
    backgroundColor: categoryColors[c.value],
    borderColor: categoryColors[c.value],
    tension: 0.3,
  })),
)

/* ---------- Chart 控制 ---------- */
const destroyChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
}

const drawChart = async () => {
  if (viewMode.value === 'table' || !hasData.value) return

  destroyChart()
  await nextTick()

  if (!chartRef.value) return

  chartInstance = new Chart(chartRef.value, {
    type: viewMode.value,
    data: {
      labels: dates.value,
      datasets: datasets.value,
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'top' } },
    },
  })
}

/* ---------- API ---------- */
const loadStats = async () => {
  loading.value = true
  appliedFilters.value = { ...uiFilters.value }

  try {
    const res = await api.get('/calendar/stats', {
      params: appliedFilters.value,
    })
    rawStats.value = Array.isArray(res.data) ? res.data : []
    await drawChart()
  } finally {
    loading.value = false
  }
}

/* ---------- 匯出 ---------- */
const exportCSV = () => {
  if (!hasData.value) return
  const headers = ['Date', 'Work', 'Personal', 'Family', 'Other', 'Total']
  const rows = tableRows.value.map((r) => [r.date, r.work, r.personal, r.family, r.other, r.total])
  const csv = '\uFEFF' + [headers, ...rows].map((r) => r.join(',')).join('\n')
  download(csv, 'calendar_stats.csv', 'text/csv')
}

const exportExcel = () => exportCSV()

const download = (content, name, type) => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

/* ---------- Watch ---------- */
watch(viewMode, drawChart)

onMounted(loadStats)
</script>

<template>
  <div class="container my-4">
    <!-- Filters -->
    <div class="card p-3 mb-3">
      <div class="row g-3 align-items-end">
        <div class="col-md-3">
          <label class="form-label">起始日期</label>
          <input type="date" class="form-control" v-model="uiFilters.start_date" />
        </div>
        <div class="col-md-3">
          <label class="form-label">結束日期</label>
          <input type="date" class="form-control" v-model="uiFilters.end_date" />
        </div>
        <div class="col-md-3">
          <label class="form-label">分類</label>
          <select class="form-select" v-model="uiFilters.category">
            <option v-for="c in categories" :key="c.value" :value="c.value">
              {{ c.label }}
            </option>
          </select>
        </div>
        <div class="col-md-3">
          <button class="btn btn-primary w-100" @click="loadStats">Search</button>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="d-flex justify-content-between mb-3">
      <div class="btn-group">
        <button
          class="btn btn-outline-secondary"
          :class="{ active: viewMode === 'table' }"
          @click="viewMode = 'table'"
        >
          Table
        </button>
        <button
          class="btn btn-outline-secondary"
          :class="{ active: viewMode === 'bar' }"
          @click="viewMode = 'bar'"
        >
          Bar
        </button>
        <button
          class="btn btn-outline-secondary"
          :class="{ active: viewMode === 'line' }"
          @click="viewMode = 'line'"
        >
          Line
        </button>
      </div>

      <div class="btn-group">
        <button class="btn btn-outline-success" :disabled="!hasData" @click="exportCSV">
          Export CSV
        </button>
        <button class="btn btn-outline-success" :disabled="!hasData" @click="exportExcel">
          Export Excel
        </button>
      </div>
    </div>

    <!-- States -->
    <div v-if="loading" class="text-center py-5">Loading...</div>
    <div v-else-if="!hasData" class="alert alert-info text-center">No data available.</div>

    <!-- Chart -->
    <canvas v-if="viewMode !== 'table' && hasData" ref="chartRef"></canvas>

    <!-- Table -->
    <table v-if="viewMode === 'table' && hasData" class="table table-bordered text-center">
      <thead class="table-light">
        <tr>
          <th>Date</th>
          <th>Work</th>
          <th>Personal</th>
          <th>Family</th>
          <th>Other</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in tableRows" :key="r.date">
          <td>{{ r.date }}</td>
          <td>{{ r.work }}</td>
          <td>{{ r.personal }}</td>
          <td>{{ r.family }}</td>
          <td>{{ r.other }}</td>
          <td class="fw-bold">{{ r.total }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
