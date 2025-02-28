import { FastifyRequest } from "fastify";
import WebSocket from "ws";
import { WebSocketMessage } from "../types.js";
import { sendMessage } from "../message/send.message.js";

export function extractUserId(request: FastifyRequest) {
    const url = new URL(request.url, `http://${request.headers.host}`);
    return Number(url.searchParams.get("userId"));
}

export function setupWebsocket(socket: WebSocket.WebSocket, req: FastifyRequest) {
	const userId = extractUserId(req);
	console.log("✅ User ID reçu:", userId);

	socket.on("message", async (message: string) => {
		try {
			const data: WebSocketMessage = JSON.parse(message.toString());
			const messageInfos = await sendMessage(userId, data);
		  
			socket.send(JSON.stringify({
			  type: "success",
			  data: messageInfos,
			}));
		  } catch (error: any) {
			console.error("❌ Erreur WebSocket:", error);
		  
			socket.send(JSON.stringify({
			  type: "error",
			  error: error.message,
			}));
		  }
	});

	socket.on("close", () => {
		console.log("🛑 Connexion WebSocket fermée");
	});
}
