export type TabelaPreco = 'preco2' | 'preco3' | 'preco4'

export interface ItemCarrinho {
  id: number
  usuario_id: number
  cod_produto: string
  quantidade: number
  preco_carrinho_catalogo: TabelaPreco
  preco_unitario: number | null
  created_at: string
  updated_at: string
  descricao?: string | null
  referencia_fabricante?: string | null
  nome_fabricante?: string | null
  estoque_total?: number | null
  preco2?: number | null
  preco3?: number | null
  preco4?: number | null
  // legado — pode vir do backend antigo
  produto?: {
    descricao: string
    preco: number | null
    nome_fabricante: string | null
  }
}
