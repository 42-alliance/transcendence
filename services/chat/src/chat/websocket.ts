import { FastifyRequest } from "fastify";
import WebSocket from "ws";
import { WebSocketMessage } from "../types.js";
import { storeMessage } from "../message/send.message.js";
import { clients, prisma } from "../index.js";

export function extractUserIdParams(request: FastifyRequest) {
    const url = new URL(request.url, `http://${request.headers.host}`);
	if (url.searchParams.get("userId") === null) {
		throw new Error("No userId in params");
	}
    return Number(url.searchParams.get("userId"));
}

async function broadcastMessage(conversationId: number, message: any) {
	try {
		const members = await prisma.conversationMember.findMany({
			where: { conversationId },
			select: { userId: true },
		});
	
		members.forEach(({ userId }) => {
			const userSockets = clients.get(userId);
			console.log("message: ", message);
			if (userSockets) {
				userSockets.forEach(socket => {
					socket.send(
						JSON.stringify({
							type: message.type,
							content: message.message.content,
							conversationId: conversationId,
							userId: message.message.userId,
							name: message.message.name,
							picture: message.message.picture,
							expiredAt: message.message.expiredAt ? message.message.expiredAt.toISOString() : null,
						})
					);
				});
			}
		});
	} catch (error) {
		console.error("Error: ", error);		
	}
}

export function setupWebsocket(socket: WebSocket.WebSocket, req: FastifyRequest) {
	try {
		const userId = extractUserIdParams(req);
		console.log("✅ User ID reçu:", userId);
	
		if (!clients.has(userId)) {
			clients.set(userId, new Set());
		}
		clients.get(userId)!.add(socket);
	
		socket.on("message", async (message: string) => {
			try {
				const data: WebSocketMessage = JSON.parse(message.toString());
				console.log("📩 Nouveau message reçu:", data);
				const messageInfos = await storeMessage(userId, data);
	
				await broadcastMessage(data.conversationId, messageInfos);
			} catch (error: any) {
				console.error("❌ Erreur WebSocket:", error);
			  
				socket.send(JSON.stringify({
					type: "error",
					error: error.message,
				}));
			}
		});
	
		socket.on("close", () => {
			console.log("🛑 Connexion WebSocket fermée pour userId:", userId);
			clients.get(userId)?.delete(socket);
			if (clients.get(userId)?.size === 0) {
				clients.delete(userId);
			}
		});
	} catch (error) {
		socket.close(1008);
	}
}
