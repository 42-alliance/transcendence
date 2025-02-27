import Fastify from "fastify";
import proxy from "@fastify/http-proxy";
import { config } from "./config.js";
import { verifyJWT } from "./verify.js";
import jwt from "@fastify/jwt";


export const server = Fastify({
    logger: {
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
    upstream: `http://${config.users.host}:${config.users.port}`,
    prefix: '/friends',
    rewritePrefix: '/friends',
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

server.register(proxy, {
	upstream: `ws://${config.chat.host}:${config.chat.port}`,
    websocket: true,
    prefix: '/chat',
	rewritePrefix: '/chat',
    http2: false,
    preHandler: async (request, reply) => {	
        request.headers['x-user-id'] = await verifyJWT(server, request, reply);
    },
    wsClientOptions: (req: any) => {
        return {
          headers: {
            "x-user-id": req.headers["x-user-id"], // Transfère le header
          },
        };
      },
});

// server.register(proxy, {
// 	upstream: `http://${config.chat.host}:${config.chat.port}`,
//     prefix: '/chat',
// 	rewritePrefix: '/chat',
//     http2: false,
// });

server.listen({ port: config.gateway.port, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`🚀 API GATEWAY listening at ${address}`);
});
