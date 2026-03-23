import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Pencil, Trash2, Loader2, X } from 'lucide-react'
import { PageHeader } from '@/components/layout/Layout'
import { adminService, type Usuario, type CriarUsuario, type EditarUsuario } from '@/services/admin.service'

const PERFIS = [
  { value: 'admin',    label: 'Admin' },
  { value: 'vendedor', label: 'Vendedor' },
  { value: 'cliente',  label: 'Cliente' },
] as const

const TABELAS = [
  { value: 'preco2', label: 'P2' },
  { value: 'preco3', label: 'P3' },
  { value: 'preco4', label: 'P4' },
] as const

const PERFIL_CORES: Record<string, string> = {
  admin:    'bg-[#FFF4D6] text-[#9A6D00] border-[#F5AD00]/30',
  vendedor: 'bg-[#E8F5E9] text-[#2E7D32] border-[#4CAF50]/30',
  cliente:  'bg-[#F0EDE8] text-[#666] border-[#E8E4DE]',
}

type FormData = {
  nome: string
  email: string
  senha: string
  perfil: 'admin' | 'vendedor' | 'cliente'
  empresa: string
  tabela_preco: 'preco2' | 'preco3' | 'preco4'
}

const FORM_VAZIO: FormData = {
  nome: '', email: '', senha: '', perfil: 'cliente', empresa: '', tabela_preco: 'preco2',
}

function Modal({ titulo, onClose, children }: { titulo: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-[#1C1C1C]">
          <h2 className="text-[13px] font-black text-white tracking-tight">{titulo}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white cursor-pointer transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[9px] font-black text-[#C8C3BC] uppercase tracking-[0.12em] mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const inputCls = "w-full h-9 px-3 rounded-lg border border-[#E8E4DE] text-[12px] text-[#1C1C1C] bg-[#FDFCFA] focus:outline-none focus:border-[#F5AD00] focus:bg-white transition-all"
const selectCls = inputCls + " cursor-pointer"

export function AdminUsuarios() {
  const queryClient = useQueryClient()
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<Usuario | null>(null)
  const [form, setForm] = useState<FormData>(FORM_VAZIO)
  const [erro, setErro] = useState('')

  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ['admin-usuarios'],
    queryFn: adminService.listarUsuarios,
  })

  const { mutate: criar, isPending: criando } = useMutation({
    mutationFn: (dados: CriarUsuario) => adminService.criarUsuario(dados),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] }); fecharModal() },
    onError: (e: Error) => setErro(e.message || 'Erro ao criar usuário'),
  })

  const { mutate: editar, isPending: editandoReq } = useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: EditarUsuario }) => adminService.editarUsuario(id, dados),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] }); fecharModal() },
    onError: (e: Error) => setErro(e.message || 'Erro ao editar usuário'),
  })

  const { mutate: deletar } = useMutation({
    mutationFn: (id: number) => adminService.deletarUsuario(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] }),
  })

  function abrirCriar() {
    setEditando(null)
    setForm(FORM_VAZIO)
    setErro('')
    setModalAberto(true)
  }

  function abrirEditar(u: Usuario) {
    setEditando(u)
    setForm({ nome: u.nome, email: u.email, senha: '', perfil: u.perfil, empresa: u.empresa ?? '', tabela_preco: u.tabela_preco })
    setErro('')
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setEditando(null)
    setErro('')
  }

  function salvar() {
    setErro('')
    if (!form.nome.trim() || !form.email.trim()) { setErro('Nome e e-mail são obrigatórios'); return }
    if (!editando && !form.senha.trim()) { setErro('Senha é obrigatória para novo usuário'); return }

    if (editando) {
      const dados: EditarUsuario = { nome: form.nome, email: form.email, perfil: form.perfil, empresa: form.empresa, tabela_preco: form.tabela_preco }
      if (form.senha.trim()) dados.senha = form.senha
      editar({ id: editando.id, dados })
    } else {
      criar({ nome: form.nome, email: form.email, senha: form.senha, perfil: form.perfil, empresa: form.empresa, tabela_preco: form.tabela_preco })
    }
  }

  const filtrados = usuarios.filter(u =>
    u.nome.toLowerCase().includes(busca.toLowerCase()) ||
    u.email.toLowerCase().includes(busca.toLowerCase()) ||
    (u.empresa ?? '').toLowerCase().includes(busca.toLowerCase())
  )

  const salvando = criando || editandoReq

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F0EDE8]">
      <PageHeader
        title="Usuários"
        subtitle={`${usuarios.length} usuário${usuarios.length !== 1 ? 's' : ''} cadastrado${usuarios.length !== 1 ? 's' : ''}`}
        actions={
          <button
            onClick={abrirCriar}
            className="flex items-center gap-1.5 h-8 px-4 rounded-xl bg-[#F5AD00] text-[#1C1C1C] text-[11px] font-black hover:bg-[#E09E00] cursor-pointer transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Novo usuário
          </button>
        }
      />

      <div className="flex-1 p-4 overflow-auto">
        <div className="bg-white rounded-xl border border-[#E8E4DE] overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.06)]">

          {/* Header com busca */}
          <div className="flex items-center gap-2 px-4 py-3 bg-[#1C1C1C] border-b border-white/[0.06]">
            <Search className="h-3 w-3 text-[#F5AD00]" />
            <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.14em] flex-1">Usuários</span>
            <div className="flex items-center gap-2 h-7 w-48 rounded-lg border border-white/10 bg-white/5 px-2.5 focus-within:border-[#F5AD00]/50 transition-all">
              <Search className="h-3 w-3 text-white/30 flex-shrink-0" />
              <input
                type="text"
                value={busca}
                onChange={e => setBusca(e.target.value)}
                placeholder="Buscar..."
                className="flex-1 text-[11px] bg-transparent focus:outline-none text-white placeholder-white/30"
              />
            </div>
          </div>

          {/* Header colunas */}
          <div className="grid grid-cols-[1fr_1fr_90px_80px_60px_72px] items-center px-4 py-2 bg-[#F8F7F4] border-b border-[#E8E4DE]">
            {['Nome', 'E-mail', 'Perfil', 'Empresa', 'Tabela', ''].map(col => (
              <span key={col} className="text-[9px] font-black text-[#C8C3BC] uppercase tracking-widest">{col}</span>
            ))}
          </div>

          {/* Linhas */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-[#F5AD00]" />
            </div>
          ) : filtrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 opacity-30">
              <p className="text-[12px] font-semibold">Nenhum usuário encontrado</p>
            </div>
          ) : (
            filtrados.map((u, i) => (
              <div
                key={u.id}
                className={`grid grid-cols-[1fr_1fr_90px_80px_60px_72px] items-center px-4 py-2.5 transition-colors hover:bg-[#F8F7F4] ${
                  i < filtrados.length - 1 ? 'border-b border-[#F2EDE8]' : ''
                } ${!u.ativo ? 'opacity-40' : ''}`}
              >
                {/* Nome + avatar */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5AD00] text-[10px] font-black text-[#1C1C1C] flex-shrink-0">
                    {u.nome.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[12px] font-semibold text-[#1C1C1C] truncate">{u.nome}</span>
                </div>

                <span className="text-[11px] text-[#888] truncate">{u.email}</span>

                <span className={`inline-flex items-center h-5 px-2 rounded-full text-[9px] font-black border w-fit ${PERFIL_CORES[u.perfil]}`}>
                  {u.perfil}
                </span>

                <span className="text-[10px] text-[#888] truncate">{u.empresa || '—'}</span>

                <span className="text-[10px] font-black text-[#F5AD00]">{u.tabela_preco.replace('preco', 'P')}</span>

                {/* Ações */}
                <div className="flex items-center gap-1 justify-end">
                  <button
                    onClick={() => abrirEditar(u)}
                    className="flex items-center justify-center h-6 w-6 rounded-lg border border-[#E8E4DE] text-[#999] hover:border-[#F5AD00] hover:text-[#F5AD00] cursor-pointer transition-all"
                    title="Editar"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => { if (confirm(`Excluir ${u.nome}?`)) deletar(u.id) }}
                    className="flex items-center justify-center h-6 w-6 rounded-lg border border-[#E8E4DE] text-[#999] hover:border-red-300 hover:text-red-400 cursor-pointer transition-all"
                    title="Excluir"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal criar/editar */}
      {modalAberto && (
        <Modal titulo={editando ? 'Editar Usuário' : 'Novo Usuário'} onClose={fecharModal}>
          <div className="p-5 space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Nome">
                <input className={inputCls} value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome completo" />
              </Campo>
              <Campo label="Empresa">
                <input className={inputCls} value={form.empresa} onChange={e => setForm(f => ({ ...f, empresa: e.target.value }))} placeholder="Opcional" />
              </Campo>
            </div>

            <Campo label="E-mail">
              <input className={inputCls} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@exemplo.com" />
            </Campo>

            <Campo label={editando ? 'Nova senha (deixe em branco para manter)' : 'Senha'}>
              <input className={inputCls} type="password" value={form.senha} onChange={e => setForm(f => ({ ...f, senha: e.target.value }))} placeholder={editando ? 'Deixe em branco para manter' : 'Mínimo 6 caracteres'} />
            </Campo>

            <div className="grid grid-cols-2 gap-3">
              <Campo label="Perfil">
                <select className={selectCls} value={form.perfil} onChange={e => setForm(f => ({ ...f, perfil: e.target.value as FormData['perfil'] }))}>
                  {PERFIS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </Campo>
              <Campo label="Tabela de Preço">
                <select className={selectCls} value={form.tabela_preco} onChange={e => setForm(f => ({ ...f, tabela_preco: e.target.value as FormData['tabela_preco'] }))}>
                  {TABELAS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </Campo>
            </div>

            {erro && (
              <p className="text-[11px] text-red-500 font-semibold bg-red-50 px-3 py-2 rounded-lg border border-red-100">{erro}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#F0EDE8]">
            <button onClick={fecharModal} className="h-8 px-4 rounded-xl border border-[#E8E4DE] text-[11px] font-bold text-[#888] hover:bg-[#F8F7F4] cursor-pointer transition-all">
              Cancelar
            </button>
            <button
              onClick={salvar}
              disabled={salvando}
              className="flex items-center gap-1.5 h-8 px-5 rounded-xl bg-[#F5AD00] text-[#1C1C1C] text-[11px] font-black hover:bg-[#E09E00] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              {salvando && <Loader2 className="h-3 w-3 animate-spin" />}
              {editando ? 'Salvar' : 'Criar usuário'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
