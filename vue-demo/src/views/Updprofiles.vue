<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const loading = ref(false)

const form = ref({
  user_name: '',
  birth: '',
  sex: null,
  user_account: '',
})

const avatarFile = ref(null)
const avatarPreview = ref('')

onMounted(async () => {
  const res = await api.get('/profile/me')
  if (res.data) {
    Object.assign(form.value, res.data)
    avatarPreview.value = res.data.avatar_url ? `${res.data.avatar_url}?t=${Date.now()}` : ''
  }
})

// 選檔：只預覽，不上傳
const onFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  avatarFile.value = file
  avatarPreview.value = URL.createObjectURL(file)
}

// 儲存：一次送出
const saveProfile = async () => {
  loading.value = true

  try {
    const fd = new FormData()
    fd.append('user_name', form.value.user_name)
    fd.append('birth', form.value.birth)
    if (form.value.sex !== null) {
      fd.append('sex', form.value.sex)
    }
    fd.append('user_account', form.value.user_account)

    if (avatarFile.value) {
      fd.append('avatar', avatarFile.value)
    }

    const res = await api.put('/profile/me', fd)

    if (res.data?.avatar_url) {
      avatarPreview.value = `${res.data.avatar_url}?t=${Date.now()}`
    }

    alert('儲存成功')

    avatarFile.value = null
  } catch (err) {
    alert('儲存失敗')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="profile-container">
    <h2>更新個人資料</h2>

    <!-- Avatar -->
    <div class="avatar-section">
      <img v-if="avatarPreview" :src="avatarPreview" alt="avatar" class="avatar" />
      <div class="upload">
        <input type="file" @change="onFileChange" accept="image/jpg,image/jpeg,image/png" />
      </div>
    </div>

    <!-- Form -->
    <div class="form-group">
      <label>帳號：</label>
      <span>{{ form.user_account }}</span>
    </div>

    <div class="form-group">
      <label>姓名：</label>
      <input v-model="form.user_name" placeholder="請輸入姓名" />
    </div>

    <div class="form-group">
      <label>生日：</label>
      <input v-model="form.birth" type="date" />
    </div>

    <div class="form-group">
      <label>性別：</label>
      <select v-model="form.sex">
        <option :value="null">請選擇</option>
        <option :value="1">男</option>
        <option :value="2">女</option>
      </select>
    </div>

    <button class="save-btn" :disabled="loading" @click="saveProfile">
      {{ loading ? '儲存中...' : '儲存' }}
    </button>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 420px;
  margin: 40px auto;
  padding: 24px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

h2 {
  text-align: center;
  margin-bottom: 24px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
  margin-bottom: 12px;
}

.upload input {
  font-size: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.form-group label {
  font-size: 14px;
  color: #374151;
  margin-bottom: 6px;
}

.form-group input,
.form-group select {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #2563eb;
}

.save-btn {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: #2563eb;
  color: #ffffff;
  font-size: 16px;
  cursor: pointer;
}

.save-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
</style>
