// Formata valor monetário em BRL
export function formatPreco(valor: number | null | undefined): string {
  if (valor == null) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

// Formata quantidade de estoque
export function formatEstoque(qtd: number): string {
  if (qtd <= 0) return 'Sem estoque'
  return new Intl.NumberFormat('pt-BR').format(qtd)
}
