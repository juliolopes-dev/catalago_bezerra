import { FastifyRequest, FastifyReply } from 'fastify'

// Verifica JWT e injeta usuário na request
export async function autenticar(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch {
    reply.status(401).send({ success: false, error: 'Não autorizado' })
  }
}

// Verifica se o usuário tem perfil admin
export async function apenasAdmin(request: FastifyRequest, reply: FastifyReply) {
  await autenticar(request, reply)
  if (request.user?.perfil !== 'admin') {
    reply.status(403).send({ success: false, error: 'Acesso negado' })
  }
}
