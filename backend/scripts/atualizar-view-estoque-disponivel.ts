import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import * as pg from 'pg'

const { Pool } = pg.default ?? pg

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  console.log('Atualizando vw_produtos_ativos com coluna estoque_disponivel...')

  await prisma.$executeRawUnsafe(`DROP MATERIALIZED VIEW IF EXISTS vw_produtos_ativos`)
  console.log('View antiga removida. Recriando...')

  await prisma.$executeRawUnsafe(`
    CREATE MATERIALIZED VIEW vw_produtos_ativos AS
    SELECT
      p."Cod_produto"            AS cod_produto,
      p."Descricao"              AS descricao,
      p."Descricao2"             AS descricao2,
      p."Referencia_fabricante"  AS referencia_fabricante,
      p."Referencia_similar"     AS referencia_similar,
      p."Observacao"             AS observacao,
      p."PRECO2"                 AS preco2,
      p."PRECO3"                 AS preco3,
      p."PRECO4"                 AS preco4,
      f."Nome_fabricante"        AS nome_fabricante,

      -- Estoque total bruto (atual)
      COALESCE(SUM(e."Estoque_atual"), 0)                                          AS estoque_total,

      -- Estoque disponível = total - bloqueado
      COALESCE(SUM(e."Estoque_atual") - SUM(e."Quantidade_bloqueada"), 0)          AS estoque_disponivel,

      -- Por filial (estoque atual — sem desconto de bloqueado por filial)
      COALESCE(SUM(CASE WHEN e."Cod_Filial" = '00' THEN e."Estoque_atual" END), 0) AS estoque_f00,
      COALESCE(SUM(CASE WHEN e."Cod_Filial" = '01' THEN e."Estoque_atual" END), 0) AS estoque_f01,
      COALESCE(SUM(CASE WHEN e."Cod_Filial" = '02' THEN e."Estoque_atual" END), 0) AS estoque_f02,
      COALESCE(SUM(CASE WHEN e."Cod_Filial" = '04' THEN e."Estoque_atual" END), 0) AS estoque_f04,
      COALESCE(SUM(CASE WHEN e."Cod_Filial" = '05' THEN e."Estoque_atual" END), 0) AS estoque_f05,
      COALESCE(SUM(CASE WHEN e."Cod_Filial" = '06' THEN e."Estoque_atual" END), 0) AS estoque_f06,

      -- Bloqueado por filial
      COALESCE(SUM(CASE WHEN e."Cod_Filial" = '00' THEN e."Quantidade_bloqueada" END), 0) AS bloqueado_f00,
      COALESCE(SUM(CASE WHEN e."Cod_Filial" = '01' THEN e."Quantidade_bloqueada" END), 0) AS bloqueado_f01,
      COALESCE(SUM(CASE WHEN e."Cod_Filial" = '02' THEN e."Quantidade_bloqueada" END), 0) AS bloqueado_f02,
      COALESCE(SUM(CASE WHEN e."Cod_Filial" = '04' THEN e."Quantidade_bloqueada" END), 0) AS bloqueado_f04,
      COALESCE(SUM(CASE WHEN e."Cod_Filial" = '05' THEN e."Quantidade_bloqueada" END), 0) AS bloqueado_f05,
      COALESCE(SUM(CASE WHEN e."Cod_Filial" = '06' THEN e."Quantidade_bloqueada" END), 0) AS bloqueado_f06,

      pc.cod_grupo               AS cod_grupo_combinado

    FROM "Produtos" p
    LEFT JOIN "Estoque"             e  ON e."Cod_produto"   = p."Cod_produto"
    LEFT JOIN "Produtos_Combinados" pc ON pc.cod_produto    = p."Cod_produto"
    LEFT JOIN "Fabricante"          f  ON f."Cod_fabricante" = p."Cod_fabricante"
    WHERE p."Status_produto" = 'S'
    GROUP BY
      p."Cod_produto", p."Descricao", p."Descricao2",
      p."Referencia_fabricante", p."Referencia_similar", p."Observacao",
      p."PRECO2", p."PRECO3", p."PRECO4",
      f."Nome_fabricante", pc.cod_grupo
    ORDER BY p."Descricao"
  `)

  console.log('✅ View atualizada com sucesso!')
  console.log('   Novas colunas: estoque_disponivel, bloqueado_f00~f06')

  // Verifica uma amostra
  const amostra = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(`
    SELECT cod_produto, estoque_total, estoque_disponivel,
           bloqueado_f00, bloqueado_f01, bloqueado_f02
    FROM vw_produtos_ativos
    WHERE estoque_disponivel < estoque_total
    LIMIT 5
  `)
  console.log('\nAmostra — produtos com bloqueio:')
  console.table(amostra)

  await prisma.$disconnect()
  await pool.end()
}

main().catch((e) => {
  console.error('❌ Erro:', e)
  process.exit(1)
})
