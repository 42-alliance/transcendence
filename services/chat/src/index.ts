import Fastify, { fastify, FastifyRequest } from "fastify";
import { config } from './config.js';
import { PrismaClient } from "@prisma/client";
import fastifyWebsocket from "@fastify/websocket";
import { error } from "console";

export const prisma = new PrismaClient();



interface ChatMessage {
    type: "message";
    roomId: number;
    content: string;
    authorId: number;
}

type WebSocketMessage =  ChatMessage;

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

export function extractUserId(request: FastifyRequest) {
	return Number(request.headers["x-user-id"] as string);
}

server.register(async function (fastify) {
    server.get("/chat", {websocket: true}, (socket, req) => {

        console.log("userId: ", req.headers["x-user-id"]);

        socket.on("message", async (message: string) => {
            try {
                const data: WebSocketMessage = JSON.parse(message.toString());
                // socket.send(JSON.stringify({
                //     message: message.toString()
                // }));
                console.log("header: ", req.headers)
                // data.authorId = extractUserId(req);
                socket.send(JSON.stringify(data))
            } catch (e) {
                console.error("ERROR WebSocket connection => ", error);
            }
        });

        socket.on('close', () => {
            console.log("Travail terminer");
        })
        
    })
})



server.listen({ port: config.chat.port, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        console.error(err);
		process.exit(1);
	}
    console.log(`Server listening at ${address}`);
});