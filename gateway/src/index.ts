import Fastify from "fastify";
import proxy from "@fastify/http-proxy";
import { config } from "./config.js";
import { verifyJWT } from "./verify.js";
import jwt from "@fastify/jwt";


export const server = Fastify({
    logger: {
        level: 'debug',
        transport: {
            target: "pino-pretty",
            options: { colorize: true },
        },
    },
});

server.register(jwt, {
	secret: config.jwt.secret,
});

server.register(proxy, {
    upstream: `http://${config.users.host}:${config.users.port}`,
    prefix: '/users',
    rewritePrefix: '/users',
    http2: false,
    preHandler: async (request, reply) => {	
        await verifyJWT(server, request, reply);
    }
});

server.register(proxy, {
	upstream: `http://${config.auth.host}:${config.auth.port}`,
    prefix: '/auth',
	rewritePrefix: '/auth',
    http2: false,
});

// TODO: for /graphiql
server.register(proxy, {
    upstream: `http://${config.users.host}:${config.users.port}`,
    prefix: '/graphiql',
    rewritePrefix: '/graphiql',
    http2: false,
});

server.register(proxy, {
    upstream: `http://${config.users.host}:${config.users.port}`,
    prefix: '/graphql',
    rewritePrefix: '/graphql',
    http2: false,
});

server.listen({ port: config.gateway.port, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`🚀 API GATEWAY listening at ${address}`);
});
