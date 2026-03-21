"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const autenticacao_1 = require("../../hooks/autenticacao");
const zod_1 = require("zod");
const addSchema = zod_1.z.object({
    cod_produto: zod_1.z.string().min(1),
    quantidade: zod_1.z.number().int().positive().default(1),
});
const updateSchema = zod_1.z.object({
    quantidade: zod_1.z.number().int().positive(),
});
const carrinhoRoutes = async (fastify) => {
    // GET /api/carrinho
    fastify.get('/', { preHandler: autenticacao_1.autenticar }, async (request, reply) => {
        const { id: usuario_id, tabela_preco, perfil } = request.user;
        const colunaPreco = (perfil === 'admin' || perfil === 'vendedor') ? 'preco2' : tabela_preco;
        const itens = await fastify.prisma.$queryRawUnsafe(`SELECT
        c.id,
        c.usuario_id,
        c.cod_produto,
        c.quantidade,
        c.created_at,
        c.updated_at,
        v.descricao,
        v.nome_fabricante,
        v.${colunaPreco}::numeric AS preco,
        v.estoque_total::numeric
      FROM catalogo_carrinho c
      LEFT JOIN vw_produtos_ativos v ON v.cod_produto = c.cod_produto
      WHERE c.usuario_id = $1
      ORDER BY c.created_at DESC`, usuario_id);
        return reply.send({ success: true, dados: itens });
    });
    // POST /api/carrinho
    fastify.post('/', { preHandler: autenticacao_1.autenticar }, async (request, reply) => {
        const resultado = addSchema.safeParse(request.body);
        if (!resultado.success) {
            return reply.status(400).send({ success: false, error: resultado.error.issues[0].message });
        }
        const { cod_produto, quantidade } = resultado.data;
        const { id: usuario_id } = request.user;
        // Upsert — se já existe incrementa, senão cria
        const item = await fastify.prisma.catalogo_carrinho.upsert({
            where: { usuario_id_cod_produto: { usuario_id, cod_produto } },
            update: { quantidade: { increment: quantidade } },
            create: { usuario_id, cod_produto, quantidade },
        });
        return reply.status(201).send({ success: true, item });
    });
    // PUT /api/carrinho/:id
    fastify.put('/:id', { preHandler: autenticacao_1.autenticar }, async (request, reply) => {
        const { id } = request.params;
        const resultado = updateSchema.safeParse(request.body);
        if (!resultado.success) {
            return reply.status(400).send({ success: false, error: resultado.error.issues[0].message });
        }
        const { id: usuario_id } = request.user;
        const item = await fastify.prisma.catalogo_carrinho.findFirst({
            where: { id: Number(id), usuario_id },
        });
        if (!item) {
            return reply.status(404).send({ success: false, error: 'Item não encontrado' });
        }
        const atualizado = await fastify.prisma.catalogo_carrinho.update({
            where: { id: Number(id) },
            data: { quantidade: resultado.data.quantidade },
        });
        return reply.send({ success: true, item: atualizado });
    });
    // DELETE /api/carrinho/:id
    fastify.delete('/:id', { preHandler: autenticacao_1.autenticar }, async (request, reply) => {
        const { id } = request.params;
        const { id: usuario_id } = request.user;
        const item = await fastify.prisma.catalogo_carrinho.findFirst({
            where: { id: Number(id), usuario_id },
        });
        if (!item) {
            return reply.status(404).send({ success: false, error: 'Item não encontrado' });
        }
        await fastify.prisma.catalogo_carrinho.delete({ where: { id: Number(id) } });
        return reply.send({ success: true });
    });
    // DELETE /api/carrinho — limpa tudo
    fastify.delete('/', { preHandler: autenticacao_1.autenticar }, async (request, reply) => {
        const { id: usuario_id } = request.user;
        await fastify.prisma.catalogo_carrinho.deleteMany({ where: { usuario_id } });
        return reply.send({ success: true });
    });
};
exports.default = carrinhoRoutes;
//# sourceMappingURL=index.js.map