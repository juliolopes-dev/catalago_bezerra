import '@fastify/jwt'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      id: number
      email: string
      perfil: string
      tabela_preco: string
    }
    user: {
      id: number
      email: string
      perfil: string
      tabela_preco: string
    }
  }
}
