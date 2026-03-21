import fp from 'fastify-plugin'
import { FastifyPluginAsync } from 'fastify'
import fastifyJwt from '@fastify/jwt'

const jwtPlugin: FastifyPluginAsync = fp(async (fastify) => {
  fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'dev_secret',
    sign: {
      expiresIn: process.env.JWT_EXPIRES_IN || '10h',
    },
  })
})

export default jwtPlugin
