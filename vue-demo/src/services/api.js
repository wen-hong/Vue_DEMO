import axios from 'axios'

const api = axios.create({
  // baseURL: 'http://localhost:3000',
  baseURL: 'https://vue-demo-backend.onrender.com',
})

// 自動帶上 token
api.interceptors.request.use((config) => {
  console.log('in api')
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    // console.log(`Bearer ${token}`)
  }
  return config
})

export default api
