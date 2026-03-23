import { FastifyPluginAsync } from 'fastify'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { apenasAdmin } from '../../hooks/autenticacao'

const criarSchema = z.object({
  nome:         z.string().min(2),
  email:        z.string().email(),
  senha:        z.string().min(6),
  perfil:       z.enum(['admin', 'vendedor', 'cliente']).default('cliente'),
  empresa:      z.string().optional(),
  tabela_preco: z.enum(['preco2', 'preco3', 'preco4']).default('preco2'),
})

const editarSchema = z.object({
  nome:         z.string().min(2).optional(),
  email:        z.string().email().optional(),
  senha:        z.string().min(6).optional(),
  perfil:       z.enum(['admin', 'vendedor', 'cliente']).optional(),
  empresa:      z.string().optional(),
  tabela_preco: z.enum(['preco2', 'preco3', 'preco4']).optional(),
  ativo:        z.boolean().optional(),
})

const adminRoutes: FastifyPluginAsync = async (fastify) => {

  // GET /api/admin/usuarios
  fastify.get('/', { preHandler: apenasAdmin }, async (request, reply) => {
    const usuarios = await fastify.prisma.usuarios_catalogo.findMany({
      where: { deleted_at: null },
      select: {
        id: true, nome: true, email: true, perfil: true,
        empresa: true, tabela_preco: true, ativo: true, created_at: true,
      },
      orderBy: { nome: 'asc' },
    })
    return reply.send({ success: true, dados: usuarios })
  })

  // POST /api/admin/usuarios
  fastify.post('/', { preHandler: apenasAdmin }, async (request, reply) => {
    const resultado = criarSchema.safeParse(request.body)
    if (!resultado.success) {
      return reply.status(400).send({ success: false, error: resultado.error.issues[0].message })
    }

    const { nome, email, senha, perfil, empresa, tabela_preco } = resultado.data

    const existe = await fastify.prisma.usuarios_catalogo.findFirst({ where: { email } })
    if (existe) {
      return reply.status(409).send({ success: false, error: 'E-mail já cadastrado' })
    }

    const hash = await bcrypt.hash(senha, 10)
    const usuario = await fastify.prisma.usuarios_catalogo.create({
      data: { nome, email, senha: hash, perfil, empresa, tabela_preco },
      select: { id: true, nome: true, email: true, perfil: true, empresa: true, tabela_preco: true, ativo: true },
    })

    fastify.log.info({ usuario_id: usuario.id }, 'Usuário criado')
    return reply.status(201).send({ success: true, usuario })
  })

  // PUT /api/admin/usuarios/:id
  fastify.put('/:id', { preHandler: apenasAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const resultado = editarSchema.safeParse(request.body)
    if (!resultado.success) {
      return reply.status(400).send({ success: false, error: resultado.error.issues[0].message })
    }

    const dados = resultado.data
    if (dados.senha) {
      (dados as Record<string, unknown>).senha = await bcrypt.hash(dados.senha, 10)
    }

    const usuario = await fastify.prisma.usuarios_catalogo.update({
      where: { id: Number(id) },
      data: dados,
      select: { id: true, nome: true, email: true, perfil: true, empresa: true, tabela_preco: true, ativo: true },
    })

    return reply.send({ success: true, usuario })
  })

  // DELETE /api/admin/usuarios/:id (soft delete)
  fastify.delete('/:id', { preHandler: apenasAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { id: adminId } = request.user

    if (Number(id) === adminId) {
      return reply.status(400).send({ success: false, error: 'Não é possível excluir seu próprio usuário' })
    }

    await fastify.prisma.usuarios_catalogo.update({
      where: { id: Number(id) },
      data: { deleted_at: new Date(), ativo: false },
    })

    return reply.send({ success: true })
  })
}

export default adminRoutes
