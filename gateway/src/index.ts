import Fastify from "fastify";
import proxy from "@fastify/http-proxy";
import { config } from "./config.js";
import { verifyJWT, verifyJWT_WebSocket } from "./verify.js";
import jwt from "@fastify/jwt";
import cors from "@fastify/cors";
import { updateLastSeen } from "./update_last_seen.js";
import { read, readFileSync } from "fs";


export const server = Fastify({
    logger: {
        transport: {
            target: "pino-pretty",
            options: { colorize: true },
        },
    },
	https: {
		key: readFileSync(config.gateway.ssl.key),  // Chemin vers la clé SSL
		cert: readFileSync(config.gateway.ssl.cert),
	},
});

server.register(cors, {
    origin: ['https://localhost:8080', 'https://127.0.0.1:8080', 'https://accounts.google.com'],  // Vous pouvez aussi ajouter Google ici si nécessaire
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],  // Autorisez les méthodes nécessaires
    credentials: true,  // Si vous avez besoin de cookies ou d'autres informations de session
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

// route pour game 
server.register(proxy, {
	upstream: `http://${config.game.host}:${config.game.port}`,
	prefix: '/game',
	rewritePrefix: '/ws/game',
	http2: false,
	preHandler: async (request, reply) => {
        try{   
            await verifyJWT(server, request, reply); 
        }
        catch (error) {
            console.error("Error in preHandler:", error);
            return reply.status(500).send({ error: "Internal Server Error" });
        }
	}
});

server.register(proxy, {
  upstream: `ws://${config.game.host}:${config.game.ws_port}`, // ws_port = 8790
  prefix: '/gamews', // endpoint exposé par le gateway
  websocket: true // 👈 important pour activer WebSocket proxy
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
    upstream: `ws://${config.users.host}:${config.users.port}`,
    websocket: true,
    prefix: "/ws/users",
    rewritePrefix: "/ws/users",
    http2: false,
    preHandler: async (request, reply) => {    
        await verifyJWT_WebSocket(server, request, reply);

        const userId = request.headers["x-user-id"];  // JWT extrait ici
        const url = new URL(request.url, `http://${request.headers.host}`);

        // Ajoute `userId` dans la query string avant de proxyfier
        url.searchParams.set("userId", userId as string);

        // 🔥 Modifie directement `request.raw.url` avant que Fastify Proxy ne traite la requête
        request.raw.url = url.pathname + url.search;
        console.log("🚀 Nouvelle URL proxyfiée:", request.raw.url);
    }
});

server.register(proxy, {
	upstream: `http://${config.auth.host}:${config.auth.port}`,
	prefix: '/auth/@me',
	rewritePrefix: '/auth/@me',
	http2: false,
	preHandler: async (request, reply) => {	
        await verifyJWT(server, request, reply);
		await updateLastSeen(server, request, reply);
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
    prefix: "/ws/chat",
    rewritePrefix: "/ws/chat",
    http2: false,
    preHandler: async (request, reply) => {    
        await verifyJWT_WebSocket(server, request, reply);

        const userId = request.headers["x-user-id"];  // JWT extrait ici
        const url = new URL(request.url, `http://${request.headers.host}`);

        // Ajoute `userId` dans la query string avant de proxyfier
        url.searchParams.set("userId", userId as string);

        // 🔥 Modifie directement `request.raw.url` avant que Fastify Proxy ne traite la requête
        request.raw.url = url.pathname + url.search;
        console.log("🚀 Nouvelle URL proxyfiée:", request.raw.url);
		await updateLastSeen(server, request, reply);
    }
});

server.register(proxy, {
	upstream: `http://${config.chat.host}:${config.chat.port}`,
    prefix: '/chat',
	rewritePrefix: '/chat',
    http2: false,
	preHandler: async (request, reply) => {	
        await verifyJWT(server, request, reply);
		await updateLastSeen(server, request, reply);
    }
});

server.register(proxy, {
	upstream: `http://${config.media.host}:${config.media.port}`,
    prefix: '/media',
    http2: false,
	preHandler: async (request, reply) => {
        if (request.method !== 'GET') {
            return reply.status(405).send({ error: 'Method not allowed' });
        }
    }
});

server.listen({ port: config.gateway.port, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`🚀 API GATEWAY listening at ${address}`);
});
