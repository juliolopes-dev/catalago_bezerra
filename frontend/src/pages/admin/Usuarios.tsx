import { Plus, Search } from 'lucide-react'
import { PageHeader } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

const USUARIOS_MOCK = [
  { id: 1, nome: 'Administrador', email: 'admin@bezerra.com.br', perfil: 'admin', filial: 'F00', ativo: true, tabela: null },
  { id: 2, nome: 'João Vendas', email: 'joao@bezerra.com.br', perfil: 'interno', filial: 'F01', ativo: true, tabela: null },
  { id: 3, nome: 'Loja Araújo', email: 'loja@araujo.com.br', perfil: 'externo', filial: 'F00', ativo: true, tabela: 'preco2' },
  { id: 4, nome: 'Oficina Silva', email: 'silva@oficina.com', perfil: 'externo', filial: 'F00', ativo: false, tabela: 'preco3' },
]

function badgePerfil(perfil: string) {
  if (perfil === 'admin') return <Badge variant="yellow">Admin</Badge>
  if (perfil === 'interno') return <Badge variant="default">Interno</Badge>
  return <Badge variant="outline">Externo</Badge>
}

export function AdminUsuarios() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Usuários"
        subtitle="Gerencie usuários e defina tabelas de preço"
        breadcrumb={['Admin', 'Usuários']}
        actions={
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" />
            Novo usuário
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="bg-white border-b border-[#D3D3D3] px-6 py-3">
        <div className="flex items-center gap-2 h-9 w-64 rounded-md border border-[#D3D3D3] bg-white px-3 focus-within:border-[#F5AD00] focus-within:ring-1 focus-within:ring-[#F5AD00] transition-all">
          <Search className="h-4 w-4 text-[#989898] flex-shrink-0" />
          <input
            type="text"
            placeholder="Buscar usuário..."
            className="flex-1 text-sm text-[#252525] placeholder-[#989898] bg-transparent focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl">

          {/* Aviso Fase 3 */}
          <div className="mb-4 rounded-lg border border-[#F5AD00]/30 bg-[#F5AD00]/5 px-4 py-3 flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-[#F5AD00] flex-shrink-0" />
            <p className="text-xs text-[#9A6D00] font-semibold">
              Preview visual — funcionalidade completa disponível na Fase 3
            </p>
          </div>

          {/* Tabela de usuários */}
          <div className="bg-white rounded-lg border border-[#D3D3D3] overflow-hidden">
            {/* Header da tabela */}
            <div className="grid grid-cols-[1fr_1fr_100px_80px_100px_80px] items-center gap-3 px-4 py-2.5 border-b border-[#F8F8F8] bg-[#F8F8F8]">
              <p className="text-xs font-semibold text-[#989898] uppercase tracking-wide">Nome</p>
              <p className="text-xs font-semibold text-[#989898] uppercase tracking-wide">E-mail</p>
              <p className="text-xs font-semibold text-[#989898] uppercase tracking-wide">Perfil</p>
              <p className="text-xs font-semibold text-[#989898] uppercase tracking-wide">Filial</p>
              <p className="text-xs font-semibold text-[#989898] uppercase tracking-wide">Tabela</p>
              <p className="text-xs font-semibold text-[#989898] uppercase tracking-wide">Status</p>
            </div>

            {USUARIOS_MOCK.map((u, i) => (
              <div
                key={u.id}
                className={`grid grid-cols-[1fr_1fr_100px_80px_100px_80px] items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#F8F8F8] transition-colors ${
                  i < USUARIOS_MOCK.length - 1 ? 'border-b border-[#F8F8F8]' : ''
                }`}
              >
                {/* Avatar + nome */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5AD00] text-xs font-bold text-[#252525] flex-shrink-0">
                    {u.nome.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-[#252525] truncate">{u.nome}</span>
                </div>

                <span className="text-sm text-[#989898] truncate">{u.email}</span>
                {badgePerfil(u.perfil)}
                <span className="text-xs font-mono text-[#4F4F4F]">{u.filial}</span>

                {/* Tabela de preço */}
                {u.tabela ? (
                  <Badge variant="yellow">{u.tabela}</Badge>
                ) : (
                  <span className="text-xs text-[#D3D3D3]">—</span>
                )}

                {/* Status */}
                {u.ativo ? (
                  <Badge variant="success">Ativo</Badge>
                ) : (
                  <Badge variant="danger">Inativo</Badge>
                )}
              </div>
            ))}
          </div>

          <p className="mt-3 text-xs text-[#989898]">
            {USUARIOS_MOCK.length} usuários cadastrados
          </p>
        </div>
      </div>
    </div>
  )
}
