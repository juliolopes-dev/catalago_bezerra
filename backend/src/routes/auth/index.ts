import { FastifyPluginAsync } from 'fastify'
import bcrypt from 'bcryptjs'
import { loginSchema } from './schema'
import { autenticar } from '../../hooks/autenticacao'

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /api/auth/login
  fastify.post('/login', async (request, reply) => {
    const resultado = loginSchema.safeParse(request.body)
    if (!resultado.success) {
      return reply.status(400).send({
        success: false,
        error: resultado.error.issues[0].message,
      })
    }

    const { email, senha } = resultado.data

    const usuario = await fastify.prisma.usuarios_catalogo.findFirst({
      where: { email, ativo: true, deleted_at: null },
    })

    if (!usuario) {
      return reply.status(401).send({ success: false, error: 'Credenciais inválidas' })
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha)
    if (!senhaCorreta) {
      return reply.status(401).send({ success: false, error: 'Credenciais inválidas' })
    }

    // tabela_preco está direto no usuário — admin e vendedor usam preco2 por padrão
    const tabela_preco = usuario.tabela_preco

    const token = fastify.jwt.sign({
      id: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
      tabela_preco,
    })

    fastify.log.info({ usuario_id: usuario.id, perfil: usuario.perfil }, 'Login realizado')

    return reply.send({
      success: true,
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        empresa: usuario.empresa,
        tabela_preco,
      },
    })
  })

  // GET /api/auth/me
  fastify.get('/me', { preHandler: autenticar }, async (request, reply) => {
    const { id } = request.user

    const usuario = await fastify.prisma.usuarios_catalogo.findFirst({
      where: { id, ativo: true, deleted_at: null },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        empresa: true,
        tabela_preco: true,
      },
    })

    if (!usuario) {
      return reply.status(404).send({ success: false, error: 'Usuário não encontrado' })
    }

    return reply.send({ success: true, usuario })
  })

  // POST /api/auth/logout (invalida no lado cliente)
  fastify.post('/logout', { preHandler: autenticar }, async (_request, reply) => {
    return reply.send({ success: true })
  })
}

export default authRoutes
