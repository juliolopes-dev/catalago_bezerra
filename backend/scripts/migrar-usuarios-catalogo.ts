import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🚀 Iniciando migração usuarios_catalogo...\n')

  // 1. Dropar tabela antiga (estava vazia)
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS catalogo_clientes CASCADE`)
  console.log('✅ Tabela catalogo_clientes removida')

  // 2. Criar usuarios_catalogo
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS usuarios_catalogo (
      id           SERIAL PRIMARY KEY,
      nome         VARCHAR(255) NOT NULL,
      email        VARCHAR(255) NOT NULL UNIQUE,
      senha        VARCHAR(255) NOT NULL,
      perfil       VARCHAR(20)  NOT NULL DEFAULT 'cliente',
      empresa      VARCHAR(255),
      tabela_preco VARCHAR(10)  NOT NULL DEFAULT 'preco2',
      ativo        BOOLEAN      NOT NULL DEFAULT TRUE,
      created_at   TIMESTAMP    NOT NULL DEFAULT (NOW() AT TIME ZONE 'America/Sao_Paulo'),
      updated_at   TIMESTAMP    NOT NULL DEFAULT (NOW() AT TIME ZONE 'America/Sao_Paulo'),
      deleted_at   TIMESTAMP
    )
  `)
  console.log('✅ Tabela usuarios_catalogo criada')

  // 3. Atualizar usuario_id em catalogo_carrinho para usar usuarios_catalogo
  //    (tabela pode ter dados — mantemos a coluna, só muda a referência lógica)
  console.log('✅ catalogo_carrinho mantida sem alteração (usuario_id agora referencia usuarios_catalogo.id)')

  // 4. Criar usuário admin
  const senhaHash = await bcrypt.hash('123456', 10)

  await prisma.$executeRawUnsafe(`
    INSERT INTO usuarios_catalogo (nome, email, senha, perfil, empresa, tabela_preco)
    VALUES ('Julio Lopes', 'juliofranlopes18@gmail.com', $1, 'admin', 'Bezerra Auto Peças', 'preco2')
    ON CONFLICT (email) DO UPDATE SET
      senha = EXCLUDED.senha,
      perfil = EXCLUDED.perfil,
      ativo = TRUE
  `, senhaHash)
  console.log('✅ Usuário admin criado: juliofranlopes18@gmail.com / 123456')

  // 5. Verificação final
  const tabelas = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('usuarios_catalogo', 'catalogo_carrinho', 'catalogo_imagens')
    ORDER BY tablename
  `
  console.log('\n📋 Tabelas no banco:')
  tabelas.forEach((t) => console.log(`   - ${t.tablename}`))

  const admins = await prisma.$queryRaw<{ id: number; nome: string; email: string; perfil: string }[]>`
    SELECT id, nome, email, perfil FROM usuarios_catalogo WHERE perfil = 'admin'
  `
  console.log('\n👤 Usuários admin:')
  admins.forEach((u) => console.log(`   - [${u.id}] ${u.nome} <${u.email}>`))

  console.log('\n✅ Migração concluída com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
