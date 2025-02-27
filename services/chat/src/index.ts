import Fastify, { fastify } from "fastify";
import { config } from './config.js';
import { PrismaClient } from "@prisma/client";
import fastifyWebsocket from "@fastify/websocket";
import { error } from "console";

export const prisma = new PrismaClient();

interface JoinMessage {
    type: "join";
    userId: number;
    actors: { id: number; username: string }[];
}

interface ChatMessage {
    type: "message";
    discussionId: number;
    userId: number;
    content: string;
}

type WebSocketMessage = JoinMessage | ChatMessage;

export const server = Fastify({
    logger: {
        transport: {
            target: "pino-pretty",
            options: { colorize: true },
        }
    }
})

server.register(fastifyWebsocket)

const client = new Map<number, Set<WebSocket>>();

server.get("/chat", {websocket: true}, (socket, req) => {
    socket.on("message", async (message: string) => {
        try {
            const data: WebSocketMessage = JSON.parse(message);
            
            switch(data.type) {
                case "join":
                    await handleJoin(socket, data.userId, data.actors);
                    break ;
                case "message":
                    await handleMessage(data.discussionId, data.userId, data.content);
                    break ;
            }
        } catch (e) {
            console.error("ERROR WebSocket connection => ", error);
        }
    })
})


server.listen({ port: config.chat.port, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        console.error(err);
		process.exit(1);
	}
    console.log(`Server listening at ${address}`);
});