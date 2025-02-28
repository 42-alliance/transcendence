import Fastify from "fastify";
import { config } from './config.js';
import { PrismaClient } from "@prisma/client";
import fastifyWebsocket from "@fastify/websocket";
import { setupWebsocket } from "./chat/websocket.js";
import { setupChatRoutes } from "./router.js";

export const prisma = new PrismaClient();

export const server = Fastify({
    logger: {
        transport: {
            target: "pino-pretty",
            options: { colorize: true },
        }
    }
})

server.register(fastifyWebsocket);

const client = new Map<number, Set<WebSocket>>();

server.register(async function (server) {
	server.get("/ws/chat", { websocket: true }, (socket, req) => {
		setupWebsocket(socket, req);
	});
});

setupChatRoutes(server);

server.listen({ port: config.chat.port, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        console.error(err);
		process.exit(1);
	}
    console.log(`Server listening at ${address}`);
});