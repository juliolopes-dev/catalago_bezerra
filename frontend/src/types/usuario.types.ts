export type Perfil = 'admin' | 'vendedor' | 'cliente'

export interface Usuario {
  id: number
  nome: string
  email: string
  perfil: Perfil
  empresa: string | null
  tabela_preco: string
}

export interface AuthResponse {
  success: boolean
  token: string
  usuario: Usuario
}
