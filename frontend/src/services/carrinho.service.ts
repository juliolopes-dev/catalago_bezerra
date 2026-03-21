import api from './api'
import type { ItemCarrinho, TabelaPreco } from '@/types/carrinho.types'

export const carrinhoService = {
  async listar(): Promise<ItemCarrinho[]> {
    const { data } = await api.get('/carrinho')
    return data.dados
  },

  async adicionar(cod_produto: string, quantidade = 1, preco_carrinho_catalogo: TabelaPreco = 'preco2'): Promise<void> {
    await api.post('/carrinho', { cod_produto, quantidade, preco_carrinho_catalogo })
  },

  async atualizar(id: number, quantidade: number): Promise<void> {
    await api.put(`/carrinho/${id}`, { quantidade })
  },

  async remover(id: number): Promise<void> {
    await api.delete(`/carrinho/${id}`)
  },

  async limpar(): Promise<void> {
    await api.delete('/carrinho')
  },
}
