"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autenticar = autenticar;
exports.apenasAdmin = apenasAdmin;
// Verifica JWT e injeta usuário na request
async function autenticar(request, reply) {
    try {
        await request.jwtVerify();
    }
    catch {
        reply.status(401).send({ success: false, error: 'Não autorizado' });
    }
}
// Verifica se o usuário tem perfil admin
async function apenasAdmin(request, reply) {
    await autenticar(request, reply);
    if (request.user?.perfil !== 'admin') {
        reply.status(403).send({ success: false, error: 'Acesso negado' });
    }
}
//# sourceMappingURL=autenticacao.js.map