import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Injeta o token em cada requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('catalogo_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Redireciona para login se token expirado
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLoginRoute = err.config?.url?.includes('/auth/login')
    if (err.response?.status === 401 && !isLoginRoute) {
      localStorage.removeItem('catalogo_token')
      localStorage.removeItem('catalogo_usuario')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

export default api
