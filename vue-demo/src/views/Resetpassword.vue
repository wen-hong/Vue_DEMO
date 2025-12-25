<template>
  <div class="container">
    <div class="login-card">
      <h2 class="login-title text-center mb-4">重設密碼</h2>

      <form @submit.prevent="changePassword">
        <!-- 當前密碼 -->
        <div class="mb-3">
          <label class="form-label">當前密碼</label>
          <div class="input-group">
            <input
              v-model="currentPassword"
              :type="currentVisible ? 'text' : 'password'"
              class="form-control"
              placeholder="輸入當前密碼"
              required
              :disabled="loading"
            />
            <a class="btn btn-outline-secondary" @click="toggleVisibility('current')">
              <i :class="currentVisible ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </a>
          </div>
        </div>

        <!-- 新密碼 -->
        <div class="mb-3">
          <label class="form-label">新密碼</label>
          <div class="input-group">
            <input
              v-model="newPassword"
              :type="newVisible ? 'text' : 'password'"
              class="form-control"
              placeholder="輸入新密碼"
              required
              :disabled="loading"
            />
            <a class="btn btn-outline-secondary" @click="toggleVisibility('new')">
              <i :class="newVisible ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </a>
          </div>
          <!-- 密碼強度提示 -->
        </div>

        <!-- 確認新密碼 -->
        <div class="mb-3">
          <label class="form-label">確認新密碼</label>
          <div class="input-group">
            <input
              v-model="confirmPassword"
              :type="confirmVisible ? 'text' : 'password'"
              class="form-control"
              placeholder="再次輸入新密碼"
              required
              :disabled="loading"
            />
            <a class="btn btn-outline-secondary" @click="toggleVisibility('confirm')">
              <i :class="confirmVisible ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </a>
          </div>
        </div>
        <ul class="rules mt-2">
          <li :class="{ valid: rules.length }">至少 6 個字元</li>
          <li :class="{ valid: rules.uppercase }">至少一個大寫字母</li>
          <li :class="{ valid: rules.lowercase }">至少一個小寫字母</li>
          <li :class="{ valid: rules.number }">至少一個數字</li>
          <li :class="{ valid: rules.special }">至少一個特殊字元 (!@#$%^&*)</li>
        </ul>

        <button type="submit" class="btn btn-primary w-100 mt-3" :disabled="loading">
          {{ loading ? '更新中...' : '更新密碼' }}
        </button>

        <p class="text-danger text-center mt-3" v-if="message">{{ message }}</p>
      </form>

      <div class="text-center mt-4">
        <RouterLink to="/">返回 Dashboard</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const message = ref('')
const loading = ref(false)

const currentVisible = ref(false)
const newVisible = ref(false)
const confirmVisible = ref(false)

const toggleVisibility = (type) => {
  if (type === 'current') currentVisible.value = !currentVisible.value
  else if (type === 'new') newVisible.value = !newVisible.value
  else if (type === 'confirm') confirmVisible.value = !confirmVisible.value
}

// 密碼規則檢查
const rules = ref({
  length: false,
  uppercase: false,
  lowercase: false,
  number: false,
  special: false,
})

watch(newPassword, (val) => {
  rules.value.length = val.length >= 6
  rules.value.uppercase = /[A-Z]/.test(val)
  rules.value.lowercase = /[a-z]/.test(val)
  rules.value.number = /\d/.test(val)
  rules.value.special = /[!@#$%^&*()_+=[\]{};':"\\|,.<>/?~-]/.test(val)
})

const isStrongPassword = computed(() => Object.values(rules.value).every(Boolean))

const changePassword = async () => {
  message.value = ''

  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    message.value = '所有欄位皆需填寫'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    message.value = '新密碼與確認密碼不一致'
    return
  }

  if (!isStrongPassword.value) {
    message.value = '新密碼不符合強度規則'
    return
  }

  loading.value = true
  try {
    const res = await api.post('/auth/Resetpassword', {
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    })

    alert(res.data.message)
    auth.logout()
    router.push('/loginbackground/login')
  } catch (err) {
    message.value = err.response?.data?.error || '更新密碼失敗'
  } finally {
    loading.value = false
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
  display: flex;
  flex-direction: column;
}

.login-title {
  font-weight: 700;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
}

.rules {
  list-style: none;
  padding-left: 0;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.rules li {
  color: red;
}

.rules li.valid {
  color: green;
}
</style>
