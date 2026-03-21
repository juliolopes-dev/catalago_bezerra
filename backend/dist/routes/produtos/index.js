"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const autenticacao_1 = require("../../hooks/autenticacao");
const zod_1 = require("zod");
const querySchema = zod_1.z.object({
    busca: zod_1.z.string().optional(),
    pagina: zod_1.z.coerce.number().int().positive().default(1),
    por_pagina: zod_1.z.coerce.number().int().positive().max(100).default(24),
});
const produtosRoutes = async (fastify) => {
    // GET /api/produtos
    fastify.get('/', { preHandler: autenticacao_1.autenticar }, async (request, reply) => {
        const resultado = querySchema.safeParse(request.query);
        if (!resultado.success) {
            return reply.status(400).send({ success: false, error: resultado.error.issues[0].message });
        }
        const { busca, pagina, por_pagina } = resultado.data;
        const { tabela_preco, perfil } = request.user;
        // admin e vendedor veem preco2 (preço base interno)
        // cliente vê a tabela atribuída ao seu perfil
        const colunaPreco = (perfil === 'admin' || perfil === 'vendedor') ? 'preco2' : tabela_preco;
        const offset = (pagina - 1) * por_pagina;
        const termoBusca = busca ? `%${busca.toUpperCase()}%` : null;
        const [produtos, totalResult] = await Promise.all([
            fastify.prisma.$queryRawUnsafe(`SELECT
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
        WHERE ($1::text IS NULL
          OR UPPER(descricao) LIKE $1
          OR UPPER(referencia_fabricante) LIKE $1
          OR UPPER(cod_produto) LIKE $1)
        ORDER BY descricao
        LIMIT $2 OFFSET $3`, termoBusca, por_pagina, offset),
            fastify.prisma.$queryRawUnsafe(`SELECT COUNT(*)::bigint AS total
         FROM vw_produtos_ativos
         WHERE ($1::text IS NULL
           OR UPPER(descricao) LIKE $1
           OR UPPER(referencia_fabricante) LIKE $1
           OR UPPER(cod_produto) LIKE $1)`, termoBusca),
        ]);
        const total = Number(totalResult[0].total);
        return reply.send({
            success: true,
            dados: produtos,
            total,
            pagina,
            por_pagina,
            total_paginas: Math.ceil(total / por_pagina),
        });
    });
    // GET /api/produtos/:cod
    fastify.get('/:cod', { preHandler: autenticacao_1.autenticar }, async (request, reply) => {
        const { cod } = request.params;
        const { tabela_preco, perfil } = request.user;
        const colunaPreco = (perfil === 'admin' || perfil === 'vendedor') ? 'preco2' : tabela_preco;
        const result = await fastify.prisma.$queryRawUnsafe(`SELECT
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
      WHERE cod_produto = $1`, cod);
        if (!result.length) {
            return reply.status(404).send({ success: false, error: 'Produto não encontrado' });
        }
        return reply.send({ success: true, produto: result[0] });
    });
};
exports.default = produtosRoutes;
//# sourceMappingURL=index.js.map