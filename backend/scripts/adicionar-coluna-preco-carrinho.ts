import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import * as pg from 'pg'

const { Pool } = pg.default ?? pg

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  console.log('Adicionando coluna preco_carrinho_catalogo na tabela catalogo_carrinho...')

  await prisma.$executeRawUnsafe(`
    ALTER TABLE catalogo_carrinho
    ADD COLUMN IF NOT EXISTS preco_carrinho_catalogo VARCHAR(10) DEFAULT 'preco2'
  `)

  console.log('✅ Coluna adicionada com sucesso!')

  const amostra = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(`
    SELECT id, cod_produto, quantidade, preco_carrinho_catalogo
    FROM catalogo_carrinho
    LIMIT 5
  `)
  console.log('\nAmostra:')
  console.table(amostra)

  await prisma.$disconnect()
  await pool.end()
}

main().catch((e) => {
  console.error('❌ Erro:', e)
  process.exit(1)
})
