import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🚀 Iniciando criação das tabelas do catálogo...')

  // catalogo_clientes
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS catalogo_clientes (
      id           SERIAL PRIMARY KEY,
      usuario_id   INTEGER NOT NULL UNIQUE,
      tabela_preco VARCHAR(10) NOT NULL DEFAULT 'preco2',
      ativo        BOOLEAN NOT NULL DEFAULT TRUE,
      created_at   TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'America/Sao_Paulo'),
      updated_at   TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'America/Sao_Paulo')
    )
  `)
  console.log('✅ Tabela catalogo_clientes criada/verificada')

  // catalogo_carrinho
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS catalogo_carrinho (
      id          SERIAL PRIMARY KEY,
      usuario_id  INTEGER NOT NULL,
      cod_produto VARCHAR(20) NOT NULL,
      quantidade  INTEGER NOT NULL DEFAULT 1,
      created_at  TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'America/Sao_Paulo'),
      updated_at  TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'America/Sao_Paulo'),
      UNIQUE(usuario_id, cod_produto)
    )
  `)
  console.log('✅ Tabela catalogo_carrinho criada/verificada')

  // catalogo_imagens
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS catalogo_imagens (
      id          SERIAL PRIMARY KEY,
      cod_produto VARCHAR(20) NOT NULL,
      url         TEXT NOT NULL,
      ordem       INTEGER NOT NULL DEFAULT 0,
      created_at  TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'America/Sao_Paulo')
    )
  `)
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_catalogo_imagens_cod_produto ON catalogo_imagens(cod_produto)
  `)
  console.log('✅ Tabela catalogo_imagens criada/verificada')

  // Verificação final
  const tabelas = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename LIKE 'catalogo_%'
    ORDER BY tablename
  `
  console.log('\n📋 Tabelas do catálogo no banco:')
  tabelas.forEach((t) => console.log(`   - ${t.tablename}`))
  console.log('\n✅ Migração concluída com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro na migração:', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
