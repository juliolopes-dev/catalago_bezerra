import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import path from 'path'

import prismaPlugin from './plugins/prisma'
import jwtPlugin from './plugins/jwt'
import authRoutes from './routes/auth'
import produtosRoutes from './routes/produtos'
import carrinhoRoutes from './routes/carrinho'
import adminRoutes from './routes/admin'

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
  },
})

async function start() {
  // Segurança
  await app.register(helmet, { global: true })
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  })

  // Plugins
  await app.register(prismaPlugin)
  await app.register(jwtPlugin)

  // Rotas da API
  await app.register(authRoutes, { prefix: '/api/auth' })
  await app.register(produtosRoutes, { prefix: '/api/produtos' })
  await app.register(carrinhoRoutes, { prefix: '/api/carrinho' })
  await app.register(adminRoutes, { prefix: '/api/admin/usuarios' })

  // Serve frontend em produção
  if (process.env.NODE_ENV === 'production') {
    const { default: fastifyStatic } = await import('@fastify/static')
    await app.register(fastifyStatic, {
      root: path.join(__dirname, '..', 'public'),
      prefix: '/',
    })
    // SPA fallback
    app.setNotFoundHandler((_request, reply) => {
      reply.sendFile('index.html')
    })
  }

  const port = Number(process.env.PORT) || 3000
  await app.listen({ port, host: '0.0.0.0' })
  app.log.info(`Servidor rodando na porta ${port}`)
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})
