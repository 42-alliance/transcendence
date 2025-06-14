import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { config } from "./config.js";

export async function updateLastSeen(server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
	try {
		// Vérifie si l'utilisateur est authentifié
		if (!request.headers['x-user-id']) {
			throw new Error("User not authenticated");
		}

		const userId = request.headers['x-user-id'];
		await fetch(`http://${config.users.host}:${config.users.port}/users/clock`, {
			method: 'GET',
			headers: {
				'x-user-id': String(userId) 
			}
		});
		
	} catch (error: any) {
		console.error("❌ [Update Last Seen Error]", error);
		return reply.status(error.statusCode || 500).send({ error: "Internal Server Error" });
	}
}