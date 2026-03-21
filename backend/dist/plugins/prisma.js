"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const prismaPlugin = (0, fastify_plugin_1.default)(async (fastify) => {
    const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
    const prisma = new client_1.PrismaClient({
        adapter,
        log: ['error', 'warn'],
    });
    await prisma.$connect();
    fastify.decorate('prisma', prisma);
    fastify.addHook('onClose', async () => {
        await prisma.$disconnect();
    });
});
exports.default = prismaPlugin;
//# sourceMappingURL=prisma.js.map