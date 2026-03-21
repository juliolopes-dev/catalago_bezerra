import api from './api'
import type { AuthResponse, Usuario } from '@/types/usuario.types'

export const authService = {
  async login(email: string, senha: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, senha })
    return data
  },

  async me(): Promise<Usuario> {
    const { data } = await api.get<{ success: boolean; usuario: Usuario }>('/auth/me')
    return data.usuario
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },
}
