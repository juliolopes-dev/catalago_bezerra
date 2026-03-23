import { api } from './api'

export type Usuario = {
  id: number
  nome: string
  email: string
  perfil: 'admin' | 'vendedor' | 'cliente'
  empresa?: string | null
  tabela_preco: 'preco2' | 'preco3' | 'preco4'
  ativo: boolean
  created_at?: string
}

export type CriarUsuario = {
  nome: string
  email: string
  senha: string
  perfil: 'admin' | 'vendedor' | 'cliente'
  empresa?: string
  tabela_preco: 'preco2' | 'preco3' | 'preco4'
}

export type EditarUsuario = Partial<Omit<CriarUsuario, 'senha'> & { senha?: string; ativo?: boolean }>

export const adminService = {
  listarUsuarios: async (): Promise<Usuario[]> => {
    const { data } = await api.get('/admin/usuarios')
    return data.dados
  },
  criarUsuario: async (dados: CriarUsuario): Promise<Usuario> => {
    const { data } = await api.post('/admin/usuarios', dados)
    return data.usuario
  },
  editarUsuario: async (id: number, dados: EditarUsuario): Promise<Usuario> => {
    const { data } = await api.put(`/admin/usuarios/${id}`, dados)
    return data.usuario
  },
  deletarUsuario: async (id: number): Promise<void> => {
    await api.delete(`/admin/usuarios/${id}`)
  },
}
