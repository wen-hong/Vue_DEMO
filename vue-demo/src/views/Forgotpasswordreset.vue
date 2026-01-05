<template>
  <div class="container d-flex justify-content-center align-items-center min-vh-100">
    <div class="card shadow-sm p-4" style="max-width: 420px; width: 100%">
      <h3 class="text-center mb-3 fw-bold">重設密碼</h3>

      <p class="text-muted text-center mb-4">請輸入新的密碼，設定完成後需重新登入。</p>

      <div class="mb-3">
        <label class="form-label">新密碼</label>
        <PasswordInput
          v-model="newPassword"
          placeholder="請輸入新密碼"
          :disabled="loading"
          required
        />
      </div>

      <div class="mb-3">
        <label class="form-label">確認新密碼</label>
        <PasswordInput
          v-model="confirmPassword"
          placeholder="再次輸入新密碼"
          :disabled="loading"
          required
        />
      </div>

      <PasswordRules :rules="rules" />

      <button class="btn btn-success w-100" @click="resetPassword" :disabled="loading">
        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
        {{ loading ? '更新中...' : '重設密碼' }}
      </button>

      <p v-if="message" class="mt-3 text-center text-danger">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/supabase'
import PasswordInput from '@/components/form/PasswordInput.vue'
import PasswordRules from '@/components/form/PasswordRules.vue'
import { getPasswordRules, validatePassword } from '@/utils/passwordValidator'

const router = useRouter()
const route = useRoute()

const newPassword = ref('')
const confirmPassword = ref('')
const message = ref('')
const loading = ref(false)

let accessToken = ''
let refreshToken = ''

const rules = computed(() => getPasswordRules(newPassword.value))

const isStrongPassword = computed(() => Object.values(rules.value).every(Boolean))

onMounted(async () => {
  const hash = route.query.hash

  if (!hash) {
    message.value = '重設連結已失效，請重新申請'
    return
  }

  const params = new URLSearchParams(hash)
  accessToken = params.get('access_token')
  refreshToken = params.get('refresh_token')

  if (!accessToken || !refreshToken) {
    message.value = '重設連結已失效，請重新申請'
    return
  }

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  if (error) {
    console.error(error)
    message.value = '連結已過期，請重新申請重設密碼'
  }
})

const resetPassword = async () => {
  const errorMsg = validatePassword(newPassword.value, confirmPassword.value, {
    requireStrong: true,
  })

  if (errorMsg) {
    message.value = errorMsg
    return
  }

  loading.value = true
  message.value = ''

  const { error } = await supabase.auth.updateUser({
    password: newPassword.value,
  })

  if (error) {
    console.error(error)
    message.value = error.message
    loading.value = false
    return
  }

  alert('密碼已成功重設，請重新登入')
  await supabase.auth.signOut()
  router.replace('/')
}
</script>
