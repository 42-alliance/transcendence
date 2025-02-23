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

// /users -> proxy vers http://localhost:<users.port>/users (RESTE IDENTIQUE)
server.register(proxy, {
    upstream: `http://user:${config.users.port}`,
    prefix: '/users',
	rewritePrefix: '/users',
    http2: false,
	preHandler: async (request, reply) => {	

        // verifier l'authenticité du token recus en header
        verifyJWT(server, request, reply);
        
		// console.log("PreHandler");
	}
});

// /auth/redirect -> proxy vers http://localhost:<auth.port>/auth/redirect (RESTE IDENTIQUE)
server.register(proxy, {
	upstream: `http://auth:${config.auth.port}`,
    prefix: '/auth',
	rewritePrefix: '/auth',
    http2: false,
});

server.listen({ port: config.gateway.port, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`🚀 API GATEWAY listening at ${address}`);
});
