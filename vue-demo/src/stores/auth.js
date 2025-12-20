import { defineStore } from 'pinia'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('access_token'),
    user: null,
  }),

  getters: {
    isLogin: (state) => !!state.token,
  },

  actions: {
    async login(email, password) {
      // 呼叫後端登入
      const res = await api.post('/login', { email, password })

      // 存 token（唯一來源）
      this.token = res.data.access_token
      localStorage.setItem('access_token', this.token)

      // 立刻驗證 token 是否有效
      await this.fetchMe()
    },

    async fetchMe() {
      const res = await api.get('/me')
      this.user = res.data
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('access_token')
    },
  },
})
