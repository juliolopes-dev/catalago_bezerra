# Catálogo Bezerra
> Memória viva do projeto. Atualizado automaticamente após qualquer mudança e antes de encerrar cada sessão.

## 🎯 Objetivo
Catálogo digital de produtos de uma distribuidora de autopeças. Uso interno (equipe de vendas) e externo (lojistas/oficinas). Clientes consultam produtos, estoque e preços — cada cliente vê a tabela de preço definida pelo admin. Permite montar lista no carrinho (sem geração de pedido por enquanto).

## 👥 Usuários e Perfis
| Perfil | Acesso |
|---|---|
| `admin` | Gerencia usuários, define tabela de preço por cliente, acesso total |
| `interno` | Equipe de vendas — vê todos os preços e estoques |
| `externo` | Lojistas/oficinas — vê apenas a tabela de preço definida pelo admin |

## ⚙️ Regras de Negócio
- Cada cliente externo tem uma tabela de preço atribuída pelo admin (`preco2`, `preco3` ou `preco4`)
- Preço é sempre calculado no backend — nunca expor tabelas não autorizadas ao frontend
- Estoque é exibido para todos os perfis (total e por filial)
- Carrinho persiste no banco por usuário (não é sessão temporária)
- Produtos ativos = `Status_produto = 'S'` — via `vw_produtos_ativos`
- Busca por descrição e referência do fabricante
- Grupos Combinados: desativado por enquanto
- Pedidos: carrinho monta lista, mas não gera pedido ainda

## 📦 Stack
- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Libs Frontend:** TanStack Query, TanStack Table, React Hook Form + Zod, Zustand (carrinho), date-fns, lucide-react
- **Backend:** Node.js + Fastify + Prisma + PostgreSQL
- **Libs Backend:** @fastify/jwt, @fastify/cors, @fastify/helmet, @fastify/rate-limit, nestjs-pino (pino nativo Fastify), zod
- **Auth:** JWT próprio (email/senha) — sem OAuth social
- **Logs:** Pino nativo Fastify | Nível produção: info
- **Segurança:** CORS com origem explícita, Helmet, Rate Limiting em rotas públicas
- **MCP:** `bzrlink-db` via `.mcp.json` no workspace (read-only para consultas)
- **Infra:** VPS + EasyPanel | Deploy: GitHub push → auto deploy | Timezone: America/Sao_Paulo

## 🗄️ Banco de Dados

### Tabelas ERP (somente leitura — sincronizadas via ETL)
> Tabelas com `hash_registro` e `data_extracao`. Não alterar via aplicação.

- `Produtos` — cadastro completo de produtos
- `Estoque` — posição por filial
- `Fabricante`, `Familia`, `Grupo`, `Subgrupo`, `Fornecedor`
- `clientes`, `cidades`
- `Pedidos`, `Movimentacao_Produtos`, `Nota_Fiscal_Entrada`
- `titulos_receber`, `movimentacao_receber`, `Trocas`, `Reservas`
- `Dav_Encerramento`, `Davpv_*`, `Cartao_Convenio`
- `Estoque_Minimo`, `Estoque_Minimo_Historico`
- `pedidos_drp`, `itens_pedido_drp`, `rotas_abastecimento`
- `nf_recebimento`, `itens_nf_recebimento`
- `Grupo_Combinados`, `Produtos_Combinados`, `multiplos_venda`

### Tabela existente (nativa do sistema BZRLINK)
- `usuarios` — autenticação e perfis (admin/interno/externo)
- `conversas`, `mensagens`, `participantes_conversa`, `mensagens_ocultas`, `reacoes_mensagem`
- `workspace_paginas`, `workspace_tarefas`, `workspace_comentarios`, `workspace_membros`, `workspace_historico`

### Tabelas novas do Catálogo (criar via script)

#### `catalogo_clientes` — Configuração de preço por cliente
```prisma
model catalogo_clientes {
  id           Int      @id @default(autoincrement())
  usuario_id   Int      @unique
  tabela_preco String   // 'preco2' | 'preco3' | 'preco4'
  ativo        Boolean  @default(true)
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt
}
```

#### `catalogo_carrinho` — Itens do carrinho por usuário
```prisma
model catalogo_carrinho {
  id          Int      @id @default(autoincrement())
  usuario_id  Int
  cod_produto String   @db.VarChar(20)
  quantidade  Int      @default(1)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  @@unique([usuario_id, cod_produto])
}
```

#### `catalogo_imagens` — Imagens por produto (para uso futuro)
```prisma
model catalogo_imagens {
  id          Int      @id @default(autoincrement())
  cod_produto String   @db.VarChar(20)
  url         String
  ordem       Int      @default(0)
  created_at  DateTime @default(now())

  @@index([cod_produto])
}
```

### Materialized View principal
**`vw_produtos_ativos`** — view materializada com:
- `cod_produto`, `descricao`, `descricao2`, `referencia_fabricante`, `referencia_similar`, `observacao`
- `preco2`, `preco3`, `preco4`
- `nome_fabricante`
- `estoque_total`, `estoque_f00`, `estoque_f01`, `estoque_f02`, `estoque_f04`, `estoque_f05`, `estoque_f06`
- `cod_grupo_combinado`
- Filtro: `Status_produto = 'S'`
- ⚠️ Precisa de `REFRESH MATERIALIZED VIEW vw_produtos_ativos` periódico (sugestão: a cada hora)

### Scripts de Migração
- `backend/scripts/criar-tabelas-catalogo.ts` — cria `catalogo_clientes`, `catalogo_carrinho`, `catalogo_imagens`

## 🔌 Rotas da API

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/api/auth/login` | Login email/senha, retorna JWT | ❌ |
| POST | `/api/auth/logout` | Logout | ✅ |
| GET | `/api/auth/me` | Dados do usuário logado + tabela de preço | ✅ |
| GET | `/api/produtos` | Listagem com busca e paginação | ✅ |
| GET | `/api/produtos/:cod` | Ficha do produto | ✅ |
| GET | `/api/carrinho` | Itens do carrinho do usuário | ✅ |
| POST | `/api/carrinho` | Adicionar item ao carrinho | ✅ |
| PUT | `/api/carrinho/:id` | Atualizar quantidade | ✅ |
| DELETE | `/api/carrinho/:id` | Remover item | ✅ |
| DELETE | `/api/carrinho` | Limpar carrinho | ✅ |
| GET | `/api/admin/usuarios` | Listar usuários | ✅ Admin |
| POST | `/api/admin/usuarios` | Criar usuário | ✅ Admin |
| PUT | `/api/admin/usuarios/:id` | Editar usuário (inclui tabela de preço) | ✅ Admin |
| DELETE | `/api/admin/usuarios/:id` | Desativar usuário (soft delete) | ✅ Admin |

## 📁 Estrutura de Pastas

```
catalogo_bezerra/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ui/              ← componentes genéricos (Button, Input, Badge...)
│       │   ├── produtos/        ← ProdutoCard, ProdutoFicha, ProdutoTabela
│       │   ├── carrinho/        ← CarrinhoDrawer, CarrinhoItem
│       │   └── admin/           ← UsuarioForm, TabelaPrecoSelect
│       ├── pages/
│       │   ├── Login.tsx
│       │   ├── Catalogo.tsx
│       │   ├── Produto.tsx
│       │   └── admin/
│       │       └── Usuarios.tsx
│       ├── hooks/               ← useProdutos, useCarrinho, useAuth
│       ├── services/            ← api.ts (axios com baseURL '/api')
│       ├── store/               ← carrinho.store.ts (Zustand)
│       ├── types/               ← produto.types.ts, usuario.types.ts
│       └── utils/               ← formatPreco, formatEstoque
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── scripts/
│   │   └── criar-tabelas-catalogo.ts
│   └── src/
│       ├── routes/
│       │   ├── auth/            ← index.ts + schema.ts
│       │   ├── produtos/        ← index.ts + schema.ts
│       │   ├── carrinho/        ← index.ts + schema.ts
│       │   └── admin/           ← index.ts + schema.ts
│       ├── plugins/
│       │   ├── prisma.ts
│       │   ├── jwt.ts
│       │   └── cors.ts
│       ├── hooks/               ← autenticacao.hook.ts (preHandler JWT)
│       ├── services/            ← produto.service.ts, carrinho.service.ts
│       └── types/               ← fastify.d.ts (augment do Request)
├── Dockerfile
├── .env.example
└── CONTEXTO.MD
```

## 🔧 Variáveis de Ambiente

```env
DATABASE_URL="postgresql://postgres:***@217.216.83.122:4121/db-bezerra-bzrlink?sslmode=disable"
TZ=America/Sao_Paulo
PGTZ=America/Sao_Paulo
JWT_SECRET=chave_secreta_forte
JWT_EXPIRES_IN=10h
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://catalogo.bezerra.com.br
CORS_ORIGIN=https://catalogo.bezerra.com.br
LOG_LEVEL=info
```

## 🛠️ Comandos Úteis
- Dev frontend: `cd frontend && npm run dev`
- Dev backend: `cd backend && npm run dev`
- Rodar migration: `cd backend && npx tsx scripts/criar-tabelas-catalogo.ts`
- Build local: `docker build -t catalogo-bezerra .`
- Refresh view: `REFRESH MATERIALIZED VIEW vw_produtos_ativos`

## ⚠️ Riscos Identificados
- **[ALTO]** Preço por cliente: lógica deve garantir que cliente nunca veja preço de outra tabela — validar sempre no backend, nunca expor colunas não autorizadas
- **[MÉDIO]** `vw_produtos_ativos` é materialized view — dados podem estar desatualizados. Definir REFRESH periódico (sugestão: 1x/hora)
- **[MÉDIO]** Carrinho sem pedido: definir se valida estoque no momento de montar a lista ou apenas exibe aviso
- **[BAIXO]** Sem imagens no momento — tabela `catalogo_imagens` já criada para uso futuro

## 📝 Decisões Técnicas
- **Fastify** ao invés de NestJS — projeto de complexidade média, sem necessidade de módulos pesados
- **Materialized View** `vw_produtos_ativos` como fonte principal — não consultar `Produtos` + `Estoque` direto nas listagens
- **Preço no backend** — a coluna correta (`preco2/3/4`) é selecionada dinamicamente pelo serviço com base no perfil do usuário, nunca enviada toda ao frontend
- **Carrinho no banco** (não localStorage) — persiste entre sessões e dispositivos
- **Sem geração de pedido** na Fase 1 e 2 — apenas montagem de lista no carrinho

## 🚀 Roadmap
- [x] **Fase 1** — Setup monorepo, Fastify, Prisma, 3 tabelas novas, auth JWT, CORS, Helmet, rate limiting, `public/version.json` + detector de versão ✅
- [ ] **Fase 2** — Módulo Produtos (listagem, busca, ficha, preço por perfil) + Carrinho
- [ ] **Fase 3** — Painel Admin (CRUD usuários, atribuição de tabela de preço)
- [ ] **Fase 4** — Filtros avançados, imagens de produto, refinamentos visuais

## 🎨 Convenções de Código
- Nomenclatura: `camelCase` (funções/variáveis), `PascalCase` (componentes), `snake_case` (banco)
- Erros backend: `{ success: false, error: "mensagem" }` — nunca expor stack trace em produção
- Imports frontend: absolutos via alias `@/`
- Rotas: sempre prefixo `/api` no backend

## 🎨 Design System
- Arquivo: `.design-engineer/system.md`
- Identidade extraída do site oficial `autopecasbezerra.com.br` via Playwright
- Cor accent: `#F5AD00` (amarelo Bezerra) — extraído do CSS Elementor (post-9.css)
- Fundo sidebar: `#252525` (preto Bezerra)
- Tipografia: Blinker (mesma do site oficial) — instalada via `@fontsource/blinker`
- Direção: Boldness & Clarity com identidade Bezerra

## 📅 Última Sessão — 2026-03-20
- Fase 1 concluída: monorepo, backend Fastify+Prisma, 3 tabelas criadas no banco, auth JWT
- Correção Prisma 7: instalado `@prisma/adapter-pg` (Prisma 7 usa WASM, exige driver adapter)
- Criado `prisma.config.ts` para configurar URL de conexão no Prisma 7
- Frontend completo: Vite+React+Tailwind+Blinker, roteamento, auth store, version.json
- Design system extraído do site oficial via Playwright — identidade Bezerra aplicada
- Telas principais refatoradas com Aria (/design-engineer): Login, Catálogo e Carrinho com precisão de tokens e densidade visual

## ➡️ Próximos Passos (Fase 2)
1. [x] Implementar rotas backend: `GET /api/produtos` e `GET /api/produtos/:cod`
2. [x] Implementar rotas carrinho: GET/POST/PUT/DELETE `/api/carrinho`
3. [x] Conectar frontend ao backend — removidos mocks, usando TanStack Query
4. [ ] Busca por descrição/referência com debounce (Backend ok, Frontend ok — falta refinar performance se necessário)
5. [x] Paginação no catálogo
6. [ ] Iniciar Fase 3: CRUD de usuários no Admin

## 📅 Histórico de Mudanças
- **2026-03-20:** Planejamento inicial — stack, módulos, banco, rotas, roadmap definidos
- **2026-03-20:** `vw_produtos_ativos` atualizada com 6 novos campos
- **2026-03-20:** Fase 1 concluída — backend+frontend base, identidade visual Bezerra aplicada
- **2026-03-20:** Atualização Geral Frontend — Refatoração Aria: tokens semânticos (Tailwind 4), PageHeader com breadcrumbs e novo visual de Login.
