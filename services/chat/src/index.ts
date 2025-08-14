import Fastify from "fastify";
import { config } from './config.js';
import WebSocket from "ws";
import { PrismaClient } from '../prisma/node_modules/@prisma/client/client.js';
import fastifyWebsocket from "@fastify/websocket";
import { setupWebsocket } from "./chat/websocket.js";
import { setupChatRoutes } from "./router.js";
import fs from "fs";
import path from "path";

// Ensure CA is trusted for outbound HTTPS fetches (Docker env may also export it)
process.env.NODE_EXTRA_CA_CERTS = process.env.NODE_EXTRA_CA_CERTS || path.resolve("./ssl/ca.pem");

export const prisma = new PrismaClient();

export const server = Fastify({
    logger: {
        transport: {
            target: "pino-pretty",
            options: { colorize: true },
        }
    },
	https: {
		key: fs.readFileSync(path.resolve("./ssl/chat.key")),
		cert: fs.readFileSync(path.resolve("./ssl/chat.crt")),
		ca: fs.readFileSync(path.resolve("./ssl/ca.pem")),
	}
})

server.register(fastifyWebsocket);

export const clients = new Map<number, Set<WebSocket.WebSocket>>(); // Stocke les WebSockets des utilisateurs connectés


server.register(async function (server) {
	server.get("/ws/chat", { websocket: true }, (socket, req) => {
		setupWebsocket(socket, req);
	});
});


setupChatRoutes(server);

server.get("/chat/healthcheck", async function handler(request, reply) {
	return reply.status(200).send("chat server is ready");
});

server.listen({ port: config.chat.port, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        console.error(err);
		process.exit(1);
	}
    console.log(`Server listening at ${address}`);
});