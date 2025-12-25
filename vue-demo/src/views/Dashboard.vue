<template>
  <div class="dashboard d-flex">
    <!-- Sidebar -->
    <aside class="sidebar p-3">
      <h5 class="fw-bold mb-4">Adminator</h5>
      <ul class="nav flex-column gap-2">
        <!-- <li class="nav-item" v-for="item in menu" :key="item.label">
          <RouterLink v-if="item.path" class="nav-link text-dark" :to="item.path">
            {{ item.label }}
          </RouterLink>

          <span v-else class="nav-link text-dark">
            {{ item.label }}
          </span>
        </li> -->
        <!-- <RouterLink v-if="item.name" class="nav-link text-dark" :to="{ name: item.name }">
          {{ item.label }}
        </RouterLink> -->
        <li class="nav-item" v-for="item in menu" :key="item.label">
          <RouterLink v-if="item && item.name" class="nav-link text-dark" :to="{ name: item.name }">
            {{ item.label }}
          </RouterLink>

          <span v-else class="nav-link text-dark">
            {{ item.label }}
          </span>
        </li>
      </ul>
    </aside>

    <!-- Main -->
    <div class="flex-grow-1">
      <!-- Top Navbar -->
      <nav class="navbar bg-white shadow-sm px-4">
        <span class="fw-bold">Dashboard</span>

        <div class="btn-group">
          <button
            type="button"
            class="btn btn-light dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {{ curruserEmail }}
          </button>
          <ul class="dropdown-menu">
            <li>
              <RouterLink class="dropdown-item" to="/dashboard/updprofiles">
                UpDate UserInfo
              </RouterLink>
            </li>
            <li>
              <RouterLink class="dropdown-item" to="/inloginbackground/resetpassword">
                Reset Password
              </RouterLink>
            </li>
            <!-- <li><a class="dropdown-item" href="#">Another action</a></li>
            <li><a class="dropdown-item" href="#">Something else here</a></li> -->
            <li><hr class="dropdown-divider" /></li>
            <li><a class="dropdown-item text-danger" @click="logout">Logout</a></li>
          </ul>
        </div>
      </nav>

      <!-- Content -->
      <div class="container-fluid p-4">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const curruserEmail = auth.user?.email
const menu = [
  //   { label: 'Dashboard', name: null },
  //   { label: 'Email', name: null },
  { label: 'Calendar', name: 'Calendarevent' },
  { label: 'CalendarDashboard', name: 'Calendardashboard' },
  //   { label: 'Forms', name: null },
  //   { label: 'Tables', name: null },
]

const logout = () => {
  auth.logout()
  router.push('/loginbackground/login')
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  min-width: 100vh;
  background: #f5f6fa;
}

/* Sidebar */
.sidebar {
  width: 240px;
  background: white;
  border-right: 1px solid #eee;
}

/* Cards */
.stat-card,
.card-box {
  background: white;
  border-radius: 14px;
  padding: 24px;
  border: 1px solid #eee;
}

.stat-card {
  transition: 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

/* Placeholder styles */
.map-placeholder,
.chart-placeholder {
  height: 260px;
  background: #f0f0f0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
}
</style>
