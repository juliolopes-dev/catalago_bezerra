import { FastifyPluginAsync } from 'fastify'
import { autenticar } from '../../hooks/autenticacao'
import { z } from 'zod'

const TABELAS_VALIDAS = ['preco2', 'preco3', 'preco4'] as const
type TabelaPreco = typeof TABELAS_VALIDAS[number]

const addSchema = z.object({
  cod_produto: z.string().min(1),
  quantidade: z.number().int().positive().default(1),
  preco_carrinho_catalogo: z.enum(TABELAS_VALIDAS).default('preco2'),
})

const updateSchema = z.object({
  quantidade: z.number().int().positive(),
})

const carrinhoRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/carrinho
  fastify.get('/', { preHandler: autenticar }, async (request, reply) => {
    const { id: usuario_id } = request.user

    // Busca itens com os três preços para exibir o escolhido por item
    const itens = await fastify.prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT
        c.id,
        c.usuario_id,
        c.cod_produto,
        c.quantidade,
        c.preco_carrinho_catalogo,
        c.created_at,
        c.updated_at,
        v.descricao,
        v.referencia_fabricante,
        v.nome_fabricante,
        v.estoque_total::numeric,
        v.preco2::numeric,
        v.preco3::numeric,
        v.preco4::numeric
      FROM catalogo_carrinho c
      LEFT JOIN vw_produtos_ativos v ON v.cod_produto = c.cod_produto
      WHERE c.usuario_id = $1
      ORDER BY c.created_at DESC`,
      usuario_id,
    )

    // Resolve o preco_unitario com base na tabela escolhida por item
    const dados = itens.map((item) => {
      const tabela = (item.preco_carrinho_catalogo as TabelaPreco) ?? 'preco2'
      return {
        ...item,
        preco_unitario: item[tabela] ?? null,
      }
    })

    return reply.send({ success: true, dados })
  })

  // POST /api/carrinho
  fastify.post('/', { preHandler: autenticar }, async (request, reply) => {
    const resultado = addSchema.safeParse(request.body)
    if (!resultado.success) {
      return reply.status(400).send({ success: false, error: resultado.error.issues[0].message })
    }

    const { cod_produto, quantidade, preco_carrinho_catalogo } = resultado.data
    const { id: usuario_id } = request.user

    const item = await fastify.prisma.catalogo_carrinho.upsert({
      where: { usuario_id_cod_produto: { usuario_id, cod_produto } },
      update: { quantidade: { increment: quantidade }, preco_carrinho_catalogo },
      create: { usuario_id, cod_produto, quantidade, preco_carrinho_catalogo },
    })

    return reply.status(201).send({ success: true, item })
  })

  // PUT /api/carrinho/:id
  fastify.put('/:id', { preHandler: autenticar }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const resultado = updateSchema.safeParse(request.body)
    if (!resultado.success) {
      return reply.status(400).send({ success: false, error: resultado.error.issues[0].message })
    }

    const { id: usuario_id } = request.user

    const item = await fastify.prisma.catalogo_carrinho.findFirst({
      where: { id: Number(id), usuario_id },
    })

    if (!item) {
      return reply.status(404).send({ success: false, error: 'Item não encontrado' })
    }

    const atualizado = await fastify.prisma.catalogo_carrinho.update({
      where: { id: Number(id) },
      data: { quantidade: resultado.data.quantidade },
    })

    return reply.send({ success: true, item: atualizado })
  })

  // DELETE /api/carrinho/:id
  fastify.delete('/:id', { preHandler: autenticar }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { id: usuario_id } = request.user

    const item = await fastify.prisma.catalogo_carrinho.findFirst({
      where: { id: Number(id), usuario_id },
    })

    if (!item) {
      return reply.status(404).send({ success: false, error: 'Item não encontrado' })
    }

    await fastify.prisma.catalogo_carrinho.delete({ where: { id: Number(id) } })

    return reply.send({ success: true })
  })

  // DELETE /api/carrinho — limpa tudo
  fastify.delete('/', { preHandler: autenticar }, async (request, reply) => {
    const { id: usuario_id } = request.user

    await fastify.prisma.catalogo_carrinho.deleteMany({ where: { usuario_id } })

    return reply.send({ success: true })
  })
}

export default carrinhoRoutes
