import { create } from 'zustand'
import type { Usuario } from '@/types/usuario.types'

interface AuthStore {
  usuario: Usuario | null
  token: string | null
  setAuth: (usuario: Usuario, token: string) => void
  clearAuth: () => void
  isAuthenticated: () => boolean
}

const TOKEN_KEY = 'catalogo_token'
const USUARIO_KEY = 'catalogo_usuario'

// Restaura sessão do localStorage
const savedToken = localStorage.getItem(TOKEN_KEY)
const savedUsuario = localStorage.getItem(USUARIO_KEY)

export const useAuthStore = create<AuthStore>((set, get) => ({
  token: savedToken,
  usuario: savedUsuario ? JSON.parse(savedUsuario) : null,

  setAuth: (usuario, token) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario))
    set({ usuario, token })
  },

  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USUARIO_KEY)
    set({ usuario: null, token: null })
  },

  isAuthenticated: () => !!get().token && !!get().usuario,
}))
