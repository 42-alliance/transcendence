import { WebSocket } from "@fastify/websocket";
import { FastifyRequest } from "fastify";
import { connectedSockets, connectedUsers, prisma } from "../index.js";

export function extractUserIdParams(request: FastifyRequest) {
    const url = new URL(request.url, `https://${request.headers.host}`);
	if (url.searchParams.get("userId") === null) {
		throw new Error("No userId in params");
	}
    return Number(url.searchParams.get("userId"));
}

async function sendMessageToAllSockets(message: any) {
	for (const [userId, sockets] of connectedSockets.entries()) {
		for (const socket of sockets) {
			if (socket.readyState === WebSocket.OPEN) {
				try {
					socket.send(JSON.stringify(message));
				} catch (error) {
					console.error(`Erreur lors de l'envoi du message à l'utilisateur ${userId}:`, error);
				}
			}
		}
	}
}

export async function setupWebsocket(socket: WebSocket, req: FastifyRequest) {
	// Ici, vous pouvez gérer les événements WebSocket

	try {
		const userId = extractUserIdParams(req);

		if (!connectedUsers.has(userId)) {
			connectedUsers.add(userId);
			connectedSockets.set(userId, new Set());
			console.log(`Utilisateur connecté: ${userId}`);
		}

		connectedSockets.get(userId)!.add(socket);

		socket.on('message', (message: string) => {
			console.log(`Message reçu: ${message}`);
			// Traitez le message reçu ici
			// Par exemple, vous pouvez envoyer une réponse au client
			socket.send(`Message reçu: ${message}`);
		});
	
	
		socket.on('close', async () => {
			connectedSockets.get(userId)?.delete(socket);
			if (connectedSockets.get(userId)?.size === 0) {
				connectedUsers.delete(userId);
				connectedSockets.delete(userId);

				prisma.users.update({
					where: { id: userId },
					data: { is_online: "offline" },
				}).catch(err => {
					console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
				});

				await sendMessageToAllSockets({
					type: "online_status",
					user_id: userId,
					status: "offline",
				});
			}
			console.log('Connexion WebSocket fermée');
		});
	
		prisma.users.update({
			where: { id: userId },
			data: { is_online: "online" },
		}).catch(err => {
			console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
		});

		await sendMessageToAllSockets({
			type: "online_status",
			user_id: userId,
			status : "online",
		});
		
	} catch (error) {
		socket.close(1008);
		console.error('Erreur dans la connexion WebSocket:', error);
	}
}