<template>
  <div class="container d-flex justify-content-center align-items-center min-vh-100">
    <div class="card shadow-sm p-4" style="max-width: 420px; width: 100%">
      <h3 class="text-center mb-3 fw-bold">忘記密碼</h3>

      <p class="text-muted text-center mb-4">
        請輸入註冊時使用的 Email，我們會寄送重設密碼的連結給你。
      </p>

      <div class="mb-3">
        <label class="form-label">Email</label>
        <input
          v-model="email"
          type="email"
          class="form-control"
          placeholder="example@email.com"
          :disabled="loading"
        />
      </div>

      <button class="btn btn-primary w-100" @click="submit" :disabled="loading || !email">
        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
        {{ loading ? '寄送中...' : '寄送重設密碼信件' }}
      </button>

      <p v-if="message" class="mt-3 text-center" :class="messageType">
        {{ message }}
      </p>
      <div class="text-center mt-4">
        <RouterLink to="/">返回 系統登入</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/services/api'

const email = ref('')
const message = ref('')
const messageType = ref('text-success')
const loading = ref(false)

const submit = async () => {
  if (!email.value) return

  message.value = ''
  loading.value = true

  try {
    const res = await api.post('/auth/forgotpassword', {
      email: email.value,
    })
    message.value = res.data.message
    messageType.value = 'text-success'
  } catch {
    message.value = '寄送失敗，請稍後再試'
    messageType.value = 'text-danger'
  } finally {
    loading.value = false
  }
}
</script>
