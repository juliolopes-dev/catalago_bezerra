import api from './api'
import type { PaginacaoProdutos, FiltrosProdutos, Produto } from '@/types/produto.types'

export const produtosService = {
  async listar(filtros: FiltrosProdutos): Promise<PaginacaoProdutos> {
    const { data } = await api.get('/produtos', { params: filtros })
    return data
  },

  async buscarPorCod(cod: string): Promise<Produto> {
    const { data } = await api.get(`/produtos/${cod}`)
    return data.produto
  },
}
