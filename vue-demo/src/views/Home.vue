<template>
  <div class="container mt-5">
    <h2>Home</h2>

    <div v-if="user">
      <p><b>User ID:</b> {{ user.id }}</p>
      <p><b>Email:</b> {{ user.email }}</p>
      <p v-if="user.profile"><b>Role:</b> {{ user.profile.role }}</p>
    </div>

    <button class="btn btn-secondary mt-3" @click="logout">Logout</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

// 從 store 取資料（單一來源）
const user = computed(() => auth.user)

const logout = () => {
  auth.logout()
  router.push('/login')
}
</script>
