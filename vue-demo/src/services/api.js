import axios from 'axios'

const api = axios.create({
  // baseURL: 'http://localhost:3000',
  // baseURL: 'http://localhost:5180', // asp.net
  baseURL: 'https://vue-demo-backend.onrender.com',
})

// 自動帶上 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const url = err.response.config.url

      if (url === '/login') {
        // 登入失敗
        return Promise.reject(err)
      } else {
        // token 過期或無效
        localStorage.clear()
        alert('登入已過期，請重新登入')
        window.location.href = '/'
        return
      }
    }
    return Promise.reject(err)
  },
)

export default api
