"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const path_1 = __importDefault(require("path"));
const prisma_1 = __importDefault(require("./plugins/prisma"));
const jwt_1 = __importDefault(require("./plugins/jwt"));
const auth_1 = __importDefault(require("./routes/auth"));
const produtos_1 = __importDefault(require("./routes/produtos"));
const carrinho_1 = __importDefault(require("./routes/carrinho"));
const app = (0, fastify_1.default)({
    logger: {
        level: process.env.LOG_LEVEL || 'info',
        transport: process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
    },
});
async function start() {
    // Segurança
    await app.register(helmet_1.default, { global: true });
    await app.register(cors_1.default, {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        credentials: true,
    });
    await app.register(rate_limit_1.default, {
        max: 100,
        timeWindow: '1 minute',
    });
    // Plugins
    await app.register(prisma_1.default);
    await app.register(jwt_1.default);
    // Rotas da API
    await app.register(auth_1.default, { prefix: '/api/auth' });
    await app.register(produtos_1.default, { prefix: '/api/produtos' });
    await app.register(carrinho_1.default, { prefix: '/api/carrinho' });
    // Serve frontend em produção
    if (process.env.NODE_ENV === 'production') {
        const { default: fastifyStatic } = await Promise.resolve().then(() => __importStar(require('@fastify/static')));
        await app.register(fastifyStatic, {
            root: path_1.default.join(__dirname, '..', 'public'),
            prefix: '/',
        });
        // SPA fallback
        app.setNotFoundHandler((_request, reply) => {
            reply.sendFile('index.html');
        });
    }
    const port = Number(process.env.PORT) || 3000;
    await app.listen({ port, host: '0.0.0.0' });
    app.log.info(`Servidor rodando na porta ${port}`);
}
start().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map