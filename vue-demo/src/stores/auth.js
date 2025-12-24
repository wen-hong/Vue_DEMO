import { defineStore } from 'pinia'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('access_token'),
    user: null,
    isReady: false,
  }),

  getters: {
    isLogin: (state) => !!state.token && !!state.user,
  },

  actions: {
    async init() {
      if (!this.token) {
        this.isReady = true
        return
      }

      try {
        await this.fetchMe()
      } catch (err) {
        // token 無效或過期
        this.logout()
      } finally {
        this.isReady = true
      }
    },

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
