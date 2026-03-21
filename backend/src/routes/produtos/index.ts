import { FastifyPluginAsync } from 'fastify'
import { autenticar } from '../../hooks/autenticacao'
import { z } from 'zod'

const querySchema = z.object({
  busca: z.string().optional(),
  modo: z.enum(['todos', 'descricao', 'codigo', 'referencia', 'similar']).default('todos'),
  pagina: z.coerce.number().int().positive().default(1),
  por_pagina: z.coerce.number().int().positive().max(100).default(24),
})

// Campos pesquisáveis por modo
const CAMPOS: Record<string, string[]> = {
  todos:      ['UPPER(descricao)', 'UPPER(cod_produto)', 'UPPER(referencia_fabricante)', 'UPPER(referencia_similar)'],
  descricao:  ['UPPER(descricao)'],
  codigo:     ['UPPER(cod_produto)'],
  referencia: ['UPPER(referencia_fabricante)'],
  similar:    ['UPPER(referencia_similar)'],
}

/**
 * Monta cláusula WHERE com AND entre palavras e OR entre campos.
 * Retorna { clause, params } onde params são os termos %PALAVRA%.
 * Os parâmetros começam em $paramOffset.
 */
function buildWhere(palavras: string[], campos: string[], paramOffset: number) {
  if (!palavras.length) return { clause: '1=1', params: [] }

  // Cada palavra deve aparecer em pelo menos um dos campos (OR entre campos, AND entre palavras)
  const blocos = palavras.map((_, wi) => {
    const ors = campos.map((campo) => `${campo} LIKE $${paramOffset + wi}`).join(' OR ')
    return `(${ors})`
  })

  return {
    clause: blocos.join(' AND '),
    params: palavras.map(p => `%${p}%`),
  }
}

const produtosRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/produtos
  fastify.get('/', { preHandler: autenticar }, async (request, reply) => {
    const resultado = querySchema.safeParse(request.query)
    if (!resultado.success) {
      return reply.status(400).send({ success: false, error: resultado.error.issues[0].message })
    }

    const { busca, modo, pagina, por_pagina } = resultado.data
    const { tabela_preco, perfil } = request.user

    const colunaPreco = (perfil === 'admin' || perfil === 'vendedor') ? 'preco2' : tabela_preco

    const offset = (pagina - 1) * por_pagina
    const palavras = busca ? busca.toUpperCase().trim().split(/\s+/).filter(Boolean) : []
    const campos = CAMPOS[modo]

    // Parâmetros fixos: LIMIT = $1, OFFSET = $2; palavras começam em $3
    const { clause, params: termParams } = buildWhere(palavras, campos, 3)
    const queryParams = [por_pagina, offset, ...termParams]

    // Para o COUNT os parâmetros de palavra começam em $1
    const { clause: clauseCount, params: termParamsCount } = buildWhere(palavras, campos, 1)

    const [produtos, totalResult] = await Promise.all([
      fastify.prisma.$queryRawUnsafe<Record<string, unknown>[]>(
        `SELECT
          cod_produto,
          descricao,
          descricao2,
          referencia_fabricante,
          referencia_similar,
          observacao,
          ${colunaPreco}::numeric AS preco,
          nome_fabricante,
          estoque_total::numeric,
          estoque_disponivel::numeric,
          estoque_f00::numeric,
          estoque_f01::numeric,
          estoque_f02::numeric,
          estoque_f04::numeric,
          estoque_f05::numeric,
          estoque_f06::numeric,
          bloqueado_f00::numeric,
          bloqueado_f01::numeric,
          bloqueado_f02::numeric,
          bloqueado_f04::numeric,
          bloqueado_f05::numeric,
          bloqueado_f06::numeric
          ${perfil === 'admin' ? ', preco2::numeric, preco3::numeric, preco4::numeric' : ''}
        FROM vw_produtos_ativos
        WHERE ${clause}
        ORDER BY descricao
        LIMIT $1 OFFSET $2`,
        ...queryParams,
      ),
      fastify.prisma.$queryRawUnsafe<[{ total: bigint }]>(
        `SELECT COUNT(*)::bigint AS total
         FROM vw_produtos_ativos
         WHERE ${clauseCount}`,
        ...termParamsCount,
      ),
    ])

    const total = Number(totalResult[0].total)

    return reply.send({
      success: true,
      dados: produtos,
      total,
      pagina,
      por_pagina,
      total_paginas: Math.ceil(total / por_pagina),
    })
  })

  // GET /api/produtos/:cod
  fastify.get('/:cod', { preHandler: autenticar }, async (request, reply) => {
    const { cod } = request.params as { cod: string }
    const { tabela_preco, perfil } = request.user

    const colunaPreco = (perfil === 'admin' || perfil === 'vendedor') ? 'preco2' : tabela_preco

    const result = await fastify.prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT
        cod_produto,
        descricao,
        descricao2,
        referencia_fabricante,
        referencia_similar,
        observacao,
        ${colunaPreco}::numeric AS preco,
        nome_fabricante,
        estoque_total::numeric,
        estoque_f00::numeric,
        estoque_f01::numeric,
        estoque_f02::numeric,
        estoque_f04::numeric,
        estoque_f05::numeric,
        estoque_f06::numeric
      FROM vw_produtos_ativos
      WHERE cod_produto = $1`,
      cod,
    )

    if (!result.length) {
      return reply.status(404).send({ success: false, error: 'Produto não encontrado' })
    }

    return reply.send({ success: true, produto: result[0] })
  })
}

export default produtosRoutes
