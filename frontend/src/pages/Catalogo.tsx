import { useState, useCallback, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search, ShoppingCart, Loader2, Package, Tag, FileText, Info, Layers,
  PanelLeftClose, PanelLeftOpen,
} from 'lucide-react'
import { produtosService } from '@/services/produtos.service'
import { carrinhoService } from '@/services/carrinho.service'
import { useOutletContext } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import type { ModoBusca } from '@/types/produto.types'
import type { TabelaPreco } from '@/types/carrinho.types'

const POR_PAGINA = 50

function formatPreco(valor: number | string | null) {
  if (valor == null) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor))
}

function parseSimilares(ref: string | null): string[] {
  if (!ref?.trim()) return []
  return ref.trim().split(/\s+/).filter(Boolean)
}

type Produto = {
  cod_produto: string
  descricao: string
  descricao2?: string | null
  referencia_fabricante?: string | null
  referencia_similar?: string | null
  observacao?: string | null
  nome_fabricante?: string | null
  estoque_total: string | number
  estoque_disponivel?: string | number | null
  estoque_f00?: string | number | null
  estoque_f01?: string | number | null
  estoque_f02?: string | number | null
  estoque_f04?: string | number | null
  estoque_f05?: string | number | null
  estoque_f06?: string | number | null
  bloqueado_f00?: string | number | null
  bloqueado_f01?: string | number | null
  bloqueado_f02?: string | number | null
  bloqueado_f04?: string | number | null
  bloqueado_f05?: string | number | null
  bloqueado_f06?: string | number | null
  preco: string | number | null
  preco2?: string | number | null
  preco3?: string | number | null
  preco4?: string | number | null
}

const FILIAIS = [
  { campo: 'estoque_f00', bloq: 'bloqueado_f00', nome: 'Petrolina' },
  { campo: 'estoque_f01', bloq: 'bloqueado_f01', nome: 'Juazeiro' },
  { campo: 'estoque_f02', bloq: 'bloqueado_f02', nome: 'Salgueiro' },
  { campo: 'estoque_f04', bloq: 'bloqueado_f04', nome: 'CD' },
  { campo: 'estoque_f05', bloq: 'bloqueado_f05', nome: 'Bonfim' },
  { campo: 'estoque_f06', bloq: 'bloqueado_f06', nome: 'Picos' },
] as const

/* ── Cabeçalho de seção ─────────────────────────────────── */
function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 bg-[#1C1C1C] border-b border-white/[0.06]">
      <Icon className="h-3 w-3 text-[#F5AD00]" />
      <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.14em]">{label}</span>
    </div>
  )
}

/* ── Campo de info técnica ──────────────────────────────── */
function MiniInfo({ label, valor, highlight, mono }: {
  label: string; valor?: string | null; highlight?: boolean; mono?: boolean
}) {
  return (
    <div className="border-b border-[#F0EDE8] pb-2.5 last:border-0 last:pb-0">
      <p className="text-[8.5px] font-bold text-[#C8C3BC] uppercase tracking-[0.1em] leading-none mb-1">{label}</p>
      <p className={`text-[11px] font-bold break-all leading-snug ${mono ? 'font-mono' : ''} ${highlight ? 'text-[#F5AD00]' : 'text-[#1C1C1C]'}`}>
        {valor || '—'}
      </p>
    </div>
  )
}

export function Catalogo() {
  const [busca, setBusca] = useState('kit emb')
  const [buscaAtiva, setBuscaAtiva] = useState('kit emb')
  const [modo, setModo] = useState<ModoBusca>('todos')
  const [pagina, setPagina] = useState(1)
  const [selecionado, setSelecionado] = useState<Produto | null>(null)
  const [demoFeito, setDemoFeito] = useState(false)
  const [modalPreco, setModalPreco] = useState<Produto | null>(null)
  const [precoEscolhido, setPrecoEscolhido] = useState<TabelaPreco>('preco2')
  const [qtdModal, setQtdModal] = useState(1)
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleBusca = useCallback((valor: string) => {
    setBusca(valor)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setBuscaAtiva(valor)
      setPagina(1)
      setSelecionado(null)
    }, 350)
  }, [])

  const buscaValida = buscaAtiva.trim().length >= 2

  const { data, isLoading } = useQuery({
    queryKey: ['produtos', buscaAtiva, modo, pagina],
    queryFn: () => produtosService.listar({ busca: buscaAtiva, modo, pagina, por_pagina: POR_PAGINA }),
    enabled: buscaValida,
    placeholderData: (prev) => prev,
  })

  const { mutate: adicionar, isPending: adicionando } = useMutation({
    mutationFn: ({ cod, tabela, qtd }: { cod: string; tabela: TabelaPreco; qtd: number }) =>
      carrinhoService.adicionar(cod, qtd, tabela),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carrinho'] })
      setModalPreco(null)
    },
  })

  function abrirModal(produto: Produto) {
    setPrecoEscolhido('preco2')
    setQtdModal(1)
    setModalPreco(produto)
  }

  function confirmarAdicionar() {
    if (!modalPreco) return
    adicionar({ cod: modalPreco.cod_produto, tabela: precoEscolhido, qtd: qtdModal })
  }

  const produtos = (data?.dados ?? []) as Produto[]

  /* Navegação por teclado */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!produtos.length) return
      const currentIndex = selecionado
        ? produtos.findIndex(p => p.cod_produto === selecionado.cod_produto)
        : -1
      if (e.key === 'ArrowDown') {
        const next = produtos[Math.min(currentIndex + 1, produtos.length - 1)]
        setSelecionado(next)
        document.getElementById(`row-${next.cod_produto}`)?.scrollIntoView({ block: 'nearest' })
        e.preventDefault()
      } else if (e.key === 'ArrowUp') {
        const prev = produtos[Math.max(currentIndex - 1, 0)]
        setSelecionado(prev)
        document.getElementById(`row-${prev.cod_produto}`)?.scrollIntoView({ block: 'nearest' })
        e.preventDefault()
      } else if (e.key === 'Enter' && selecionado && document.activeElement !== inputRef.current) {
        abrirModal(selecionado)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [produtos, selecionado, adicionar])

  useEffect(() => {
    if (!demoFeito && produtos.length > 0) {
      setSelecionado(produtos[0])
      setDemoFeito(true)
    }
  }, [produtos, demoFeito])

  const semEstoque = selecionado ? Number(selecionado.estoque_total) <= 0 : false
  const similares = parseSimilares(selecionado?.referencia_similar ?? null)
  const { sidebarAberta, setSidebarAberta } = useOutletContext<{ sidebarAberta: boolean; setSidebarAberta: (v: (p: boolean) => boolean) => void }>()
  const { usuario } = useAuthStore()
  const isAdmin = usuario?.perfil === 'admin'
  type CampoPreco = 'preco2' | 'preco3' | 'preco4'
  const [campoPreco, setCampoPreco] = useState<CampoPreco>('preco2')

  type CampoSaldo = 'estoque_total' | 'estoque_disponivel' | 'estoque_f00' | 'estoque_f01' | 'estoque_f02' | 'estoque_f04' | 'estoque_f05' | 'estoque_f06'
  const [campoSaldo, setCampoSaldo] = useState<CampoSaldo>('estoque_total')
  const OPCOES_SALDO: { value: CampoSaldo; label: string }[] = [
    { value: 'estoque_total',     label: 'Total' },
    { value: 'estoque_disponivel', label: 'Disponível' },
    { value: 'estoque_f00',       label: 'Petrolina' },
    { value: 'estoque_f01',       label: 'Juazeiro' },
    { value: 'estoque_f02',       label: 'Salgueiro' },
    { value: 'estoque_f04',       label: 'CD' },
    { value: 'estoque_f05',       label: 'Bonfim' },
    { value: 'estoque_f06',       label: 'Picos' },
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F0EDE8]">

      {/* ── Header com busca centralizada ───────────── */}
      <div className="flex-shrink-0 bg-white border-b border-[#E8E4DE] px-6 py-2 grid grid-cols-3 items-center gap-4">
        {/* Esquerda — toggle + título */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarAberta(v => !v)}
            className="flex items-center justify-center h-7 w-7 rounded-lg border border-[#E8E4DE] text-[#999] hover:text-[#1C1C1C] hover:border-[#F5AD00] cursor-pointer transition-all flex-shrink-0"
            title={sidebarAberta ? 'Fechar menu' : 'Abrir menu'}
          >
            {sidebarAberta
              ? <PanelLeftClose className="h-3.5 w-3.5" />
              : <PanelLeftOpen className="h-3.5 w-3.5" />
            }
          </button>
          <div>
            <h1 className="text-[15px] font-black text-[#1C1C1C] tracking-tight leading-none">Catálogo</h1>
            <p className="text-[11px] text-[#999] mt-0.5">
              {buscaValida && data ? `${data.total.toLocaleString('pt-BR')} produtos encontrados` : 'Bezerra Autopeças'}
            </p>
          </div>
        </div>

        {/* Centro — busca + modos */}
        <div className="flex flex-col gap-1.5">
          <div className={`flex items-center gap-2 h-9 rounded-xl border px-3 transition-all duration-150 ${
            busca
              ? 'border-[#F5AD00] bg-white shadow-[0_0_0_3px_rgba(245,173,0,0.1)]'
              : 'border-[#E0DBD4] bg-[#F8F7F4] focus-within:border-[#F5AD00] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(245,173,0,0.1)]'
          }`}>
            {isLoading
              ? <Loader2 className="h-3.5 w-3.5 text-[#F5AD00] animate-spin flex-shrink-0" />
              : <Search className="h-3.5 w-3.5 text-[#C8C3BC] flex-shrink-0" />
            }
            <input
              ref={inputRef}
              type="text"
              value={busca}
              onChange={(e) => handleBusca(e.target.value)}
              placeholder="Produto, código ou referência..."
              className="flex-1 text-[12px] bg-transparent focus:outline-none text-[#1C1C1C] placeholder-[#C8C3BC]"
              autoFocus
            />
          </div>
          {/* Mini botões de modo */}
          <div className="flex items-center justify-center gap-1">
            {([
              { value: 'todos',      label: 'Todos' },
              { value: 'descricao',  label: 'Descrição' },
              { value: 'codigo',     label: 'Código' },
              { value: 'referencia', label: 'Referência' },
              { value: 'similar',    label: 'Similar' },
            ] as { value: ModoBusca; label: string }[]).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => { setModo(value); setPagina(1); setSelecionado(null) }}
                className={`h-5 px-2.5 rounded-md text-[9px] font-bold cursor-pointer transition-all ${
                  modo === value
                    ? 'bg-[#1C1C1C] text-[#F5AD00]'
                    : 'bg-[#F0EDE8] text-[#999] hover:text-[#555]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Direita — vazio para balancear */}
        <div />
      </div>

      {/* ── Grid principal ───────────────────────────── */}
      <div className="flex-1 p-2 grid grid-cols-12 gap-2 overflow-hidden">

        {/* COLUNA ESQUERDA — Tabela + Aplicação */}
        <div className="col-span-9 flex flex-col gap-2 overflow-hidden">

          {/* Tabela de produtos */}
          <div className="flex-1 flex flex-col rounded-xl border border-[#E8E4DE] bg-white overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
            <SectionHeader icon={Layers} label="Produtos" />

            <div className="flex-1 overflow-auto">
              {isLoading && !data ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-[#F5AD00]" />
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="grid grid-cols-[24px_88px_1fr_110px_110px_56px_96px] bg-[#F8F7F4] border-b border-[#E8E4DE] h-7 items-center">
                      <th className="px-2 text-[9px] text-left text-[#C8C3BC] font-bold uppercase tracking-widest"></th>
                      <th className="px-2 text-[9px] text-left text-[#C8C3BC] font-bold uppercase tracking-widest">Código</th>
                      <th className="px-2 text-[9px] text-left text-[#C8C3BC] font-bold uppercase tracking-widest">Descrição</th>
                      <th className="px-2 text-[9px] text-left text-[#C8C3BC] font-bold uppercase tracking-widest">Referência</th>
                      <th className="px-2 text-[9px] text-left text-[#C8C3BC] font-bold uppercase tracking-widest">Fabricante</th>
                      <th className="px-2 text-center">
                        <select
                          value={campoSaldo}
                          onChange={(e) => setCampoSaldo(e.target.value as CampoSaldo)}
                          className="text-[9px] font-bold text-[#C8C3BC] bg-transparent border-none outline-none cursor-pointer appearance-none text-center w-full uppercase tracking-widest leading-none h-full p-0"
                        >
                          {OPCOES_SALDO.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </th>
                      <th className="px-2 pr-3 text-right">
                        {isAdmin ? (
                          <select
                            value={campoPreco}
                            onChange={(e) => setCampoPreco(e.target.value as CampoPreco)}
                            className="text-[9px] font-bold text-[#C8C3BC] bg-transparent border-none outline-none cursor-pointer appearance-none text-right w-full uppercase tracking-widest leading-none h-full p-0"
                          >
                            <option value="preco2">P2</option>
                            <option value="preco3">P3</option>
                            <option value="preco4">P4</option>
                          </select>
                        ) : (
                          <span className="text-[9px] text-[#C8C3BC] font-bold uppercase tracking-widest">Preço</span>
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtos.map((p) => {
                      const sel = selecionado?.cod_produto === p.cod_produto
                      const semEst = Number(p.estoque_total) <= 0
                      return (
                        <tr
                          id={`row-${p.cod_produto}`}
                          key={p.cod_produto}
                          onClick={() => setSelecionado(p)}
                          className={`grid grid-cols-[24px_88px_1fr_110px_110px_56px_96px] border-b cursor-pointer transition-colors duration-100 ${
                            sel
                              ? 'bg-[#FFF9EC] border-[#F5E8B0] border-l-2 border-l-[#F5AD00]'
                              : 'border-[#F2EDE8] hover:bg-[#F8F7F4]'
                          }`}
                        >
                          <td className="px-2 py-1.5 self-center flex justify-center">
                            <ShoppingCart className={`h-2.5 w-2.5 ${semEst ? 'text-[#E8E4DE]' : 'text-[#F5AD00]'}`} />
                          </td>
                          <td className="px-2 py-1.5 self-center">
                            <span className={`font-mono text-[10px] tabular-nums font-bold ${sel ? 'text-[#F5AD00]' : 'text-[#AFAFAF]'}`}>
                              {p.cod_produto}
                            </span>
                          </td>
                          <td className="px-2 py-1.5 self-center min-w-0">
                            <p className="text-[11px] font-semibold text-[#1C1C1C] truncate leading-tight">{p.descricao}</p>
                          </td>
                          <td className="px-2 py-1.5 self-center min-w-0">
                            <span className="font-mono text-[10px] text-[#888] truncate block">{p.referencia_fabricante ?? '—'}</span>
                          </td>
                          <td className="px-2 py-1.5 self-center">
                            <span className="text-[10px] text-[#888] truncate block">{p.nome_fabricante ?? '—'}</span>
                          </td>
                          <td className="px-2 py-1.5 self-center text-center">
                            <span className={`text-[10px] font-bold tabular-nums ${semEst ? 'text-red-400' : 'text-[#555]'}`}>
                              {Number(p[campoSaldo] ?? 0).toFixed(0)}
                            </span>
                          </td>
                          <td className="px-2 py-1.5 self-center text-right pr-3">
                            <span className={`text-[11px] font-black tabular-nums ${sel ? 'text-[#F5AD00]' : 'text-[#1C1C1C]'}`}>
                              {formatPreco(isAdmin ? (p[campoPreco] ?? p.preco) : p.preco)}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Painel Aplicação */}
          <div className="flex-1 flex flex-col rounded-xl border border-[#E8E4DE] bg-white overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
            <SectionHeader icon={FileText} label="Aplicação" />

            <div className="flex-1 overflow-auto px-4 py-3">
              {selecionado ? (
                <div className="flex flex-col gap-2 h-full">
                  {/* Cabeçalho do produto */}
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span className="inline-flex items-center h-5 px-2 rounded bg-[#1C1C1C] text-[9px] font-black text-[#F5AD00] uppercase tracking-wide flex-shrink-0">
                      {selecionado.nome_fabricante}
                    </span>
                    <h2 className="text-[13px] font-black text-[#1C1C1C] leading-tight border-l-2 border-[#F5AD00] pl-2.5 truncate">
                      {selecionado.descricao}
                    </h2>
                  </div>

                  {/* descricao2 */}
                  {selecionado.descricao2 && (
                    <div className="flex-shrink-0">
                      <p className="text-[8.5px] font-black text-[#C8C3BC] uppercase tracking-[0.12em] mb-1">Complemento</p>
                      <p className="text-[11px] text-[#555]">{selecionado.descricao2}</p>
                    </div>
                  )}

                  {/* Observações */}
                  <div className="flex-1 flex flex-col min-h-0">
                    <p className="text-[8.5px] font-black text-[#C8C3BC] uppercase tracking-[0.12em] mb-1 flex-shrink-0">Observações / Aplicação</p>
                    <div className="flex-1 rounded-lg border border-[#EEE9E3] bg-[#FDFCFA] px-3 py-2.5 overflow-auto">
                      <p className="text-[10.5px] text-[#555] leading-relaxed whitespace-pre-line">
                        {selecionado.observacao?.trim() || 'Sem observações adicionais.'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-2 opacity-20">
                  <Package className="h-8 w-8" />
                  <p className="text-[11px] font-semibold">Selecione um produto</p>
                </div>
              )}
            </div>

            {/* Footer preço + botão */}
            {selecionado && (
              <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-[#1C1C1C] border-t border-white/[0.06] flex-shrink-0">
                <div className="flex items-center gap-4">
                  {/* Preço principal */}
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[8px] font-black text-[#F5AD00]/60 uppercase tracking-widest">P2</span>
                    <span className="text-[18px] font-black text-[#F5AD00] leading-none tabular-nums tracking-tight">
                      {formatPreco(selecionado.preco2 ?? selecionado.preco)}
                    </span>
                  </div>
                  {selecionado.preco3 != null && (
                    <div className="flex items-baseline gap-1 border-l border-white/10 pl-4">
                      <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">P3</span>
                      <span className="text-[13px] font-black text-white/80 leading-none tabular-nums">
                        {formatPreco(selecionado.preco3)}
                      </span>
                    </div>
                  )}
                  {selecionado.preco4 != null && (
                    <div className="flex items-baseline gap-1 border-l border-white/10 pl-4">
                      <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">P4</span>
                      <span className="text-[13px] font-black text-white/80 leading-none tabular-nums">
                        {formatPreco(selecionado.preco4)}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => abrirModal(selecionado)}
                  disabled={semEstoque}
                  className="flex items-center gap-2 h-8 px-5 rounded-xl bg-[#F5AD00] text-[#1C1C1C] text-[11px] font-black hover:bg-[#E09E00] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all shadow-[0_2px_8px_rgba(245,173,0,0.25)]"
                >
                  <ShoppingCart className="h-3 w-3" />
                  {semEstoque ? 'Sem estoque' : 'Adicionar  ↵'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* COLUNA DIREITA — Info técnica + Similares */}
        <div className="col-span-3 flex flex-col gap-2 overflow-hidden">

          {/* Info Adicional */}
          <div className="flex flex-col rounded-xl border border-[#E8E4DE] bg-white overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
            <SectionHeader icon={Info} label="Info Adicional" />
            <div className="p-3 space-y-2.5">
              <MiniInfo label="Fabricante" valor={selecionado?.nome_fabricante} />
              <MiniInfo label="Ref. Fabricante" valor={selecionado?.referencia_fabricante} highlight mono />
              <MiniInfo label="Código" valor={selecionado?.cod_produto} mono />
              <MiniInfo
                label="Estoque Total"
                valor={
                  !selecionado ? undefined
                  : semEstoque ? 'Sem estoque'
                  : `${Number(selecionado.estoque_total).toFixed(0)} unidades`
                }
              />

              {/* Estoque por filial */}
              {selecionado && (
                <div>
                  <p className="text-[8.5px] font-black text-[#C8C3BC] uppercase tracking-[0.1em] mb-1.5">Por filial — disponível</p>
                  <div className="grid grid-cols-2 gap-1">
                    {FILIAIS.map(({ campo, bloq, nome }) => {
                      const total = Number(selecionado[campo] ?? 0)
                      const bloqueado = Number(selecionado[bloq] ?? 0)
                      const disponivel = total - bloqueado
                      const temEstoque = disponivel > 0
                      return (
                        <div
                          key={campo}
                          className={`flex items-center justify-between px-2 py-1 rounded-lg border ${
                            temEstoque ? 'bg-white border-[#E8E4DE]' : 'bg-[#FAFAF8] border-[#F0EDE8]'
                          }`}
                        >
                          <span className="text-[9px] font-bold text-[#999] truncate">{nome}</span>
                          <div className="flex items-center gap-1 ml-1">
                            <span className={`text-[10px] font-black tabular-nums ${temEstoque ? 'text-[#1C1C1C]' : 'text-[#D8D3CC]'}`}>
                              {disponivel}
                            </span>
                            {bloqueado > 0 && (
                              <span
                                title="Confirmar estoque"
                                className="text-[8px] font-black text-[#F5AD00] bg-[#FFF4D6] px-1 rounded tabular-nums cursor-help"
                              >
                                +{bloqueado}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Similares */}
          <div className="flex-1 flex flex-col rounded-xl border border-[#E8E4DE] bg-white overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
            <SectionHeader icon={Tag} label={`Similares${similares.length ? ` · ${similares.length}` : ''}`} />
            <div className="flex-1 overflow-auto px-3 py-3">
              {!selecionado && (
                <p className="text-[11px] text-[#D8D3CC]">—</p>
              )}
              {selecionado && similares.length === 0 && (
                <p className="text-[11px] text-[#C8C3BC]">Nenhum similar</p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {similares.map((ref) => (
                  <span
                    key={ref}
                    className="inline-flex items-center h-6 px-2.5 rounded-lg bg-[#F5F3EF] border border-[#E8E4DE] font-mono text-[10px] text-[#555] font-bold"
                  >
                    {ref}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Modal seleção de preço ────────────────────── */}
      {modalPreco && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-[#E8E4DE] shadow-[0_8px_32px_rgba(0,0,0,0.15)] w-[360px] overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#1C1C1C]">
              <ShoppingCart className="h-3.5 w-3.5 text-[#F5AD00]" />
              <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.14em]">Adicionar ao Carrinho</span>
            </div>

            {/* Produto */}
            <div className="px-4 py-3 border-b border-[#F0EDE8]">
              <p className="text-[11px] font-bold text-[#999] font-mono">{modalPreco.cod_produto}</p>
              <p className="text-[13px] font-black text-[#1C1C1C] leading-tight mt-0.5 truncate">{modalPreco.descricao}</p>
            </div>

            {/* Quantidade */}
            <div className="px-4 py-3 border-b border-[#F0EDE8] flex items-center justify-between">
              <p className="text-[9px] font-black text-[#C8C3BC] uppercase tracking-[0.12em]">Quantidade</p>
              <div className="flex items-center gap-2 bg-[#F8F7F4] rounded-lg border border-[#E8E4DE] px-2 py-1">
                <button
                  onClick={() => setQtdModal(q => Math.max(1, q - 1))}
                  className="h-6 w-6 rounded-md bg-white border border-[#E8E4DE] flex items-center justify-center text-[14px] font-black text-[#999] hover:border-[#F5AD00] hover:text-[#1C1C1C] transition-all cursor-pointer"
                >−</button>
                <input
                  type="number"
                  min={1}
                  value={qtdModal}
                  onChange={(e) => setQtdModal(Math.max(1, Number(e.target.value)))}
                  className="w-10 text-center text-[13px] font-black text-[#1C1C1C] bg-transparent focus:outline-none tabular-nums"
                />
                <button
                  onClick={() => setQtdModal(q => q + 1)}
                  className="h-6 w-6 rounded-md bg-white border border-[#E8E4DE] flex items-center justify-center text-[14px] font-black text-[#999] hover:border-[#F5AD00] hover:text-[#1C1C1C] transition-all cursor-pointer"
                >+</button>
              </div>
            </div>

            {/* Seleção de preço */}
            <div className="px-4 py-4">
              <p className="text-[9px] font-black text-[#C8C3BC] uppercase tracking-[0.12em] mb-3">Selecione a tabela de preço</p>
              <div className="flex flex-col gap-2">
                {([
                  { tabela: 'preco2' as TabelaPreco, label: 'P2 — Preço Base' },
                  { tabela: 'preco3' as TabelaPreco, label: 'P3 — Preço Varejo' },
                  { tabela: 'preco4' as TabelaPreco, label: 'P4 — Preço Atacado' },
                ]).filter(({ tabela }) => modalPreco[tabela] != null).map(({ tabela, label }) => (
                  <button
                    key={tabela}
                    onClick={() => setPrecoEscolhido(tabela)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                      precoEscolhido === tabela
                        ? 'bg-[#FFF9EC] border-[#F5AD00] border-2'
                        : 'bg-[#FAFAF8] border-[#E8E4DE] hover:border-[#F5AD00]/50'
                    }`}
                  >
                    <span className={`text-[11px] font-bold ${precoEscolhido === tabela ? 'text-[#1C1C1C]' : 'text-[#555]'}`}>{label}</span>
                    <span className={`text-[13px] font-black tabular-nums ${precoEscolhido === tabela ? 'text-[#F5AD00]' : 'text-[#1C1C1C]'}`}>
                      {formatPreco(modalPreco[tabela] ?? null)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-2 px-4 pb-4">
              <button
                onClick={() => setModalPreco(null)}
                className="flex-1 h-9 rounded-xl border border-[#E8E4DE] text-[11px] font-black text-[#999] hover:text-[#1C1C1C] hover:border-[#1C1C1C] cursor-pointer transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAdicionar}
                disabled={adicionando}
                className="flex-1 h-9 rounded-xl bg-[#F5AD00] text-[#1C1C1C] text-[11px] font-black hover:bg-[#E09E00] active:scale-95 disabled:opacity-50 cursor-pointer transition-all shadow-[0_2px_8px_rgba(245,173,0,0.3)] flex items-center justify-center gap-2"
              >
                {adicionando ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShoppingCart className="h-3 w-3" />}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
