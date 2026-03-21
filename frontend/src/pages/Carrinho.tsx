import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ShoppingCart, Trash2, Loader2, ArrowLeft, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { carrinhoService } from '@/services/carrinho.service'
import type { ItemCarrinho } from '@/types/carrinho.types'
import { useOutletContext } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

function formatPreco(valor: number | string | null | undefined) {
  if (valor == null) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor))
}

const LABEL_TABELA: Record<string, string> = {
  preco2: 'P2',
  preco3: 'P3',
  preco4: 'P4',
}

export function Carrinho() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { sidebarAberta, setSidebarAberta } = useOutletContext<{ sidebarAberta: boolean; setSidebarAberta: (v: (p: boolean) => boolean) => void }>()

  const { data: itens = [], isLoading } = useQuery({
    queryKey: ['carrinho'],
    queryFn: carrinhoService.listar,
  })

  const { mutate: atualizar } = useMutation({
    mutationFn: ({ id, quantidade }: { id: number; quantidade: number }) =>
      carrinhoService.atualizar(id, quantidade),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['carrinho'] }),
  })

  const { mutate: remover } = useMutation({
    mutationFn: (id: number) => carrinhoService.remover(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['carrinho'] }),
  })

  const { mutate: limpar, isPending: limpando } = useMutation({
    mutationFn: carrinhoService.limpar,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['carrinho'] }),
  })

  const total = itens.reduce((acc, item) => acc + Number(item.preco_unitario ?? 0) * item.quantidade, 0)
  const totalItens = itens.reduce((acc, item) => acc + item.quantidade, 0)

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F0EDE8]">

      {/* ── Header ───────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-b border-[#E8E4DE] px-6 py-2 flex items-center gap-3">
        <button
          onClick={() => setSidebarAberta(v => !v)}
          className="flex items-center justify-center h-7 w-7 rounded-lg border border-[#E8E4DE] text-[#999] hover:text-[#1C1C1C] hover:border-[#F5AD00] cursor-pointer transition-all flex-shrink-0"
          title={sidebarAberta ? 'Fechar menu' : 'Abrir menu'}
        >
          {sidebarAberta ? <PanelLeftClose className="h-3.5 w-3.5" /> : <PanelLeftOpen className="h-3.5 w-3.5" />}
        </button>
        <div className="flex-1">
          <h1 className="text-[15px] font-black text-[#1C1C1C] tracking-tight leading-none">Carrinho</h1>
          <p className="text-[11px] text-[#999] mt-0.5">
            {itens.length > 0 ? `${itens.length} ${itens.length === 1 ? 'item' : 'itens'} · ${totalItens} unidades` : 'Sua lista está vazia'}
          </p>
        </div>
        {itens.length > 0 && (
          <button
            disabled={limpando}
            onClick={() => limpar()}
            className="flex items-center gap-2 h-8 px-4 rounded-xl bg-red-50 text-red-500 font-black text-[11px] hover:bg-red-500 hover:text-white transition-all cursor-pointer border border-red-100"
          >
            {limpando ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
            Esvaziar
          </button>
        )}
      </div>

      {/* ── Conteúdo ─────────────────────────────────── */}
      <div className="flex-1 overflow-hidden p-2 flex gap-2">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-[#F5AD00] animate-spin" />
          </div>
        ) : itens.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="h-16 w-16 rounded-xl bg-white border border-[#E8E4DE] shadow-[0_1px_6px_rgba(0,0,0,0.06)] flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-[#E8E4DE]" />
            </div>
            <div className="text-center">
              <h2 className="text-[15px] font-black text-[#1C1C1C]">Carrinho vazio</h2>
              <p className="text-[12px] text-[#999] mt-1">Navegue pelo catálogo e adicione produtos.</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 h-9 px-5 rounded-xl bg-[#1C1C1C] text-[#F5AD00] text-[12px] font-black hover:opacity-80 transition-all cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Ir para o Catálogo
            </button>
          </div>
        ) : (
          <>
            {/* Tabela de itens */}
            <div className="flex-1 flex flex-col rounded-xl border border-[#E8E4DE] bg-white overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
              {/* Header da seção */}
              <div className="flex items-center gap-2 px-3 py-2.5 bg-[#1C1C1C] border-b border-white/[0.06]">
                <ShoppingCart className="h-3 w-3 text-[#F5AD00]" />
                <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.14em]">Itens</span>
              </div>

              <div className="flex-1 overflow-auto">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="grid grid-cols-[88px_1fr_110px_80px_100px_110px_40px] bg-[#F8F7F4] border-b border-[#E8E4DE] h-7 items-center">
                      <th className="px-2 text-[9px] text-left text-[#C8C3BC] font-bold uppercase tracking-widest">Código</th>
                      <th className="px-2 text-[9px] text-left text-[#C8C3BC] font-bold uppercase tracking-widest">Descrição</th>
                      <th className="px-2 text-[9px] text-left text-[#C8C3BC] font-bold uppercase tracking-widest">Referência</th>
                      <th className="px-2 text-[9px] text-center text-[#C8C3BC] font-bold uppercase tracking-widest">Tabela</th>
                      <th className="px-2 text-[9px] text-center text-[#C8C3BC] font-bold uppercase tracking-widest">Qtd</th>
                      <th className="px-2 text-[9px] text-right text-[#C8C3BC] font-bold uppercase tracking-widest pr-3">Total</th>
                      <th className="px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {itens.map((item: ItemCarrinho, i) => (
                      <tr
                        key={item.id}
                        className={`grid grid-cols-[88px_1fr_110px_80px_100px_110px_40px] border-b border-[#F2EDE8] hover:bg-[#F8F7F4] transition-colors ${i % 2 === 1 ? 'bg-[#FDFCFA]' : 'bg-white'}`}
                      >
                        <td className="px-2 py-2 self-center">
                          <span className="font-mono text-[10px] font-bold text-[#AFAFAF]">{item.cod_produto}</span>
                        </td>
                        <td className="px-2 py-2 self-center min-w-0">
                          <p className="text-[11px] font-semibold text-[#1C1C1C] truncate leading-tight">
                            {item.descricao ?? item.produto?.descricao ?? item.cod_produto}
                          </p>
                          {(item.nome_fabricante ?? item.produto?.nome_fabricante) && (
                            <p className="text-[9px] text-[#999] truncate">{item.nome_fabricante ?? item.produto?.nome_fabricante}</p>
                          )}
                        </td>
                        <td className="px-2 py-2 self-center">
                          <span className="font-mono text-[10px] text-[#888]">{item.referencia_fabricante ?? '—'}</span>
                        </td>
                        <td className="px-2 py-2 self-center text-center">
                          <span className="inline-flex items-center h-5 px-2 rounded-md bg-[#1C1C1C] text-[9px] font-black text-[#F5AD00]">
                            {LABEL_TABELA[item.preco_carrinho_catalogo] ?? item.preco_carrinho_catalogo}
                          </span>
                        </td>
                        <td className="px-2 py-2 self-center">
                          <div className="flex items-center justify-center gap-1 bg-[#F8F7F4] rounded-lg border border-[#E8E4DE] px-1 py-0.5">
                            <button
                              onClick={() => item.quantidade > 1
                                ? atualizar({ id: item.id, quantidade: item.quantidade - 1 })
                                : remover(item.id)
                              }
                              className="h-5 w-5 rounded-md bg-white border border-[#E8E4DE] flex items-center justify-center text-[12px] font-black text-[#999] hover:border-[#F5AD00] hover:text-[#1C1C1C] transition-all cursor-pointer"
                            >−</button>
                            <span className="text-[11px] font-black text-[#1C1C1C] tabular-nums w-5 text-center">{item.quantidade}</span>
                            <button
                              onClick={() => atualizar({ id: item.id, quantidade: item.quantidade + 1 })}
                              className="h-5 w-5 rounded-md bg-white border border-[#E8E4DE] flex items-center justify-center text-[12px] font-black text-[#999] hover:border-[#F5AD00] hover:text-[#1C1C1C] transition-all cursor-pointer"
                            >+</button>
                          </div>
                        </td>
                        <td className="px-2 py-2 self-center text-right pr-3">
                          <p className="text-[9px] text-[#C8C3BC] font-bold">
                            {formatPreco(item.preco_unitario)} / un
                          </p>
                          <p className="text-[12px] font-black text-[#1C1C1C] tabular-nums">
                            {formatPreco(Number(item.preco_unitario ?? 0) * item.quantidade)}
                          </p>
                        </td>
                        <td className="px-2 py-2 self-center">
                          <button
                            onClick={() => remover(item.id)}
                            className="h-6 w-6 flex items-center justify-center rounded-lg text-[#E8E4DE] hover:text-red-400 hover:bg-red-50 transition-all cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Resumo */}
            <div className="w-64 flex flex-col gap-2">
              <div className="flex flex-col rounded-xl border border-[#E8E4DE] bg-white overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-2 px-3 py-2.5 bg-[#1C1C1C] border-b border-white/[0.06]">
                  <Info className="h-3 w-3 text-[#F5AD00]" />
                  <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.14em]">Resumo</span>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-[#999]">Produtos</span>
                    <span className="text-[11px] font-black text-[#1C1C1C]">{itens.length} SKU</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-[#999]">Volume total</span>
                    <span className="text-[11px] font-black text-[#1C1C1C]">{totalItens} un</span>
                  </div>
                  <div className="h-px bg-[#E8E4DE]" />
                  <div className="flex justify-between items-end">
                    <span className="text-[11px] font-black text-[#999] uppercase tracking-wide">Total</span>
                    <span className="text-[20px] font-black text-[#1C1C1C] tabular-nums leading-none">{formatPreco(total)}</span>
                  </div>
                </div>

                <div className="mx-4 mb-4 rounded-lg bg-[#FAFAF8] border border-[#EEE9E3] px-3 py-2.5 flex gap-2">
                  <Info className="h-3.5 w-3.5 text-[#F5AD00] flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-[#999] font-bold leading-relaxed">
                    Cotação sujeita à disponibilidade real no momento da separação.
                  </p>
                </div>

                <div className="px-4 pb-4">
                  <button className="w-full h-10 rounded-xl bg-[#F5AD00] text-[#1C1C1C] text-[12px] font-black hover:bg-[#E09E00] active:scale-95 transition-all cursor-pointer shadow-[0_2px_8px_rgba(245,173,0,0.3)]">
                    Confirmar Conferência
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
