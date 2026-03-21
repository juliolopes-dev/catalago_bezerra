import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/auth.service'
import { useNavigate } from 'react-router-dom'

export function useAuth() {
  const { usuario, setAuth, clearAuth, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  async function login(email: string, senha: string) {
    const { token, usuario } = await authService.login(email, senha)
    setAuth(usuario, token)
    navigate('/')
  }

  async function logout() {
    try {
      await authService.logout()
    } finally {
      clearAuth()
      navigate('/login')
    }
  }

  return { usuario, login, logout, isAuthenticated }
}
