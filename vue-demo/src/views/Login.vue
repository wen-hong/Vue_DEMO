<template>
  <!-- <div class="container">
    <h2>登入</h2>
    <form @submit.prevent="onSubmit">
      <div>
        <label>Username</label>
        <input v-model="username" />
      </div>
      <div>
        <label>Password</label>
        <input type="password" v-model="password" />
      </div>
      <button type="submit">登入</button>
      <p v-if="error" style="color: red">{{ error }}</p>
    </form>
  </div> -->
  <div id="loginApp" class="container">
    <div class="login-card">
      <h2 class="login-title mb-4 text-center">系統登入</h2>
      <form @submit.prevent="login">
        <!-- <div class="mb-3">
          <label class="form-label">帳號</label>
          <input type="text" class="form-control" v-model="username" placeholder="請輸入帳號" />
        </div> -->

        <div class="mb-3">
          <label class="form-label">Email</label>
          <!-- <input type="text" class="form-control" v-model="username" placeholder="請輸入帳號" /> -->
          <input v-model="email" class="form-control" placeholder="請輸入Email" />
        </div>

        <div class="mb-3">
          <label class="form-label">密碼</label>
          <input type="password" class="form-control" v-model="password" placeholder="請輸入密碼" />
        </div>

        <button type="submit" class="btn btn-success w-100 py-2 mt-3">登入</button>

        <p class="text-danger text-center mt-3" v-if="error">
          {{ error }}
        </p>
        <RouterLink to="/register">尚未註冊？建立帳號</RouterLink>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// import api from '@/services/api'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()
const auth = useAuthStore()

const login = async () => {
  error.value = ''

  try {
    // 只呼叫 store
    await auth.login(email.value, password.value)

    // 登入成功後再導頁
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.error || 'Login failed'
  }
}
</script>

<!-- <script>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
  setup() {
    const username = ref('')
    const password = ref('')
    const error = ref('')
    const router = useRouter()
    const route = useRoute()
    const auth = useAuthStore()

    const onSubmit = async () => {
      error.value = ''
      try {
        await auth.login({ username: username.value, password: password.value })
        const redirect = route.query.redirect || '/'
        router.push(redirect)
      } catch (e) {
        error.value = e.message || '登入失敗'
      }
    }

    return { username, password, error, onSubmit }
  },
}
</script> -->

<style>
body {
  background: #f5f5f5;
  font-family: 'Segoe UI';
}

.login-card {
  max-width: 420px;
  margin: 100px auto;
  padding: 40px;
  border-radius: 14px;
  background: white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.07);
}

.login-title {
  font-weight: 700;
  font-size: 2rem;
}
</style>
