<template>
  <div class="container">
    <div class="login-card">
      <h2 class="login-title text-center mb-4">使用者註冊</h2>

      <form @submit.prevent="register">
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input
            v-model="email"
            type="email"
            class="form-control"
            placeholder="請輸入 Email"
            required
          />
        </div>

        <div class="mb-3">
          <label class="form-label">密碼</label>
          <div class="input-group">
            <input
              v-model="password"
              :type="isVisible ? 'text' : 'password'"
              class="form-control"
              placeholder="至少 6 碼"
              required
            />
            <a class="btn btn-outline-secondary" @click="toggleVisibility">
              <i :class="isVisible ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </a>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">再次確認密碼</label>
          <div class="input-group">
            <input
              v-model="repassword"
              :type="reisVisible ? 'text' : 'password'"
              class="form-control"
              placeholder="至少 6 碼"
              required
            />
            <a class="btn btn-outline-secondary" @click="toggleVisibility('re')">
              <i :class="reisVisible ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </a>
          </div>
        </div>

        <button type="submit" class="btn btn-primary w-100 mt-3">註冊</button>

        <p class="text-danger text-center mt-3" v-if="error">
          {{ error }}
        </p>

        <p class="text-success text-center mt-3" v-if="success">註冊成功，請前往登入</p>
      </form>

      <div class="text-center mt-4">
        <RouterLink to="/loginbackground/login">已經有帳號？前往登入</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

const email = ref('')
const password = ref('')
const repassword = ref('')
// const displayName = ref('')
const error = ref('')
const success = ref(false)
const isVisible = ref(false)
const reisVisible = ref(false)

// 切換顯示狀態的方法
const toggleVisibility = (v) => {
  if (v == 're') {
    reisVisible.value = !reisVisible.value
  } else {
    isVisible.value = !isVisible.value
  }
}

const register = async () => {
  error.value = ''
  success.value = false

  if (password.value.length < 6) {
    error.value = '密碼至少需 6 碼'
    return
  }

  if (password.value != repassword.value) {
    error.value = '密碼不一致'
    return
  }

  try {
    await api.post('/register', {
      email: email.value,
      password: password.value,
      // displayName: displayName.value,
    })

    success.value = true

    // 1.5 秒後導向登入頁
    setTimeout(() => {
      router.push('/loginbackground/login')
    }, 1500)
  } catch (err) {
    error.value = err.response?.data?.error || err.message || '註冊失敗'
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 40px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.07);
}

.login-title {
  font-weight: 700;
  font-size: 1.8rem;
}
</style>
