export interface Produto {
  cod_produto: string
  descricao: string
  descricao2: string | null
  referencia_fabricante: string | null
  referencia_similar: string | null
  observacao: string | null
  preco: number | null
  nome_fabricante: string | null
  estoque_total: number
  estoque_f00: number
  estoque_f01: number
  estoque_f02: number
  estoque_f04: number
  estoque_f05: number
  estoque_f06: number
}

export interface PaginacaoProdutos {
  dados: Produto[]
  total: number
  pagina: number
  por_pagina: number
  total_paginas: number
}

export type ModoBusca = 'todos' | 'descricao' | 'codigo' | 'referencia' | 'similar'

export interface FiltrosProdutos {
  busca?: string
  modo?: ModoBusca
  pagina?: number
  por_pagina?: number
}
