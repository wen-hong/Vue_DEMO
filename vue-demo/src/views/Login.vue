<template>
  <div id="loginApp" class="container">
    <div class="login-card">
      <h2 class="login-title mb-4 text-center">系統登入</h2>
      <form @submit.prevent="login">
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input v-model="email" class="form-control" placeholder="請輸入Email" />
        </div>

        <div class="mb-3">
          <label class="form-label">密碼</label>
          <PasswordInput v-model="password" placeholder="請輸入密碼" required />
        </div>

        <button type="submit" class="btn btn-success w-100 py-2 mt-3">登入</button>

        <p class="text-danger text-center mt-3" v-if="error">
          {{ error }}
        </p>
        <!-- <RouterLink to="/register">尚未註冊？建立帳號</RouterLink> -->
        <RouterLink to="/loginbackground/register">尚未註冊？建立帳號</RouterLink>
        <br />
        <RouterLink to="/loginbackground/forgotpassword">忘記密碼</RouterLink>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// import api from '@/services/api'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import PasswordInput from '@/components/form/PasswordInput.vue'

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()
const auth = useAuthStore()
const isVisible = ref(false) // 控制是否顯示明碼

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

async function checklogin() {
  // 假設這裡登入成功
  // authStore.isLogin = true

  router.push('/dashboard')
}
</script>

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
