<template>
  <div class="container">
    <div class="login-card">
      <h2 class="login-title text-center mb-4">重設密碼</h2>

      <form @submit.prevent="changePassword">
        <!-- 當前密碼 -->
        <div class="mb-3">
          <label class="form-label">當前密碼</label>
          <PasswordInput v-model="currentPassword" placeholder="輸入當前密碼" required />
        </div>

        <!-- 新密碼 -->
        <div class="mb-3">
          <label class="form-label">新密碼</label>
          <PasswordInput v-model="newPassword" placeholder="輸入新密碼" required />
        </div>

        <!-- 確認新密碼 -->
        <div class="mb-3">
          <label class="form-label">確認新密碼</label>
          <PasswordInput v-model="confirmPassword" placeholder="再次輸入新密碼" required />
        </div>

        <PasswordRules :rules="rules" />

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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import PasswordInput from '@/components/form/PasswordInput.vue'
import PasswordRules from '@/components/form/PasswordRules.vue'
import { getPasswordRules, validatePassword } from '@/utils/passwordValidator'

const router = useRouter()
const auth = useAuthStore()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const message = ref('')
const loading = ref(false)

const rules = computed(() => getPasswordRules(newPassword.value))

const isStrongPassword = computed(() => Object.values(rules.value).every(Boolean))

const changePassword = async () => {
  message.value = ''

  const errorMsg = validatePassword(newPassword.value, confirmPassword.value, {
    requireStrong: true,
  })

  if (errorMsg) {
    message.value = errorMsg
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
