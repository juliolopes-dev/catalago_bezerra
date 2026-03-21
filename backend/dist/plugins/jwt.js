"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const jwtPlugin = (0, fastify_plugin_1.default)(async (fastify) => {
    fastify.register(jwt_1.default, {
        secret: process.env.JWT_SECRET || 'dev_secret',
        sign: {
            expiresIn: process.env.JWT_EXPIRES_IN || '10h',
        },
    });
});
exports.default = jwtPlugin;
//# sourceMappingURL=jwt.js.map