import { FastifyInstance, FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import { prisma } from "../../index.js";
import { extractUserId } from "../../utils.js";
import { Type } from '@sinclair/typebox'

export const getPendingFriendRequestSchema: FastifySchema = {
	headers: Type.Object({
		"x-user-id": Type.String({ pattern: "^[0-9]+$" }),
	}),
};

export async function getPendingFriendRequest(request: FastifyRequest, reply: FastifyReply) {
	const userId = extractUserId(request);

	console.log("Getting pending requests for user:", userId);

	try {
		// Demandes reçues (incoming)
		const incomingPendingRequests = await prisma.friends.findMany({
			where: {
				receiverId: userId,
				status: 'pending'
			},
			include: {
				sender: true
			}
		});

		// Demandes envoyées (outgoing)
		const outgoingPendingRequests = await prisma.friends.findMany({
			where: {
				senderId: userId,
				status: 'pending'
			},
			include: {
				receiver: true
			}
		});

		const incoming = incomingPendingRequests.map(request => ({
			type: 'incoming',
			user: {
				id: request.sender.id,
				name: request.sender.name,
				picture: request.sender.picture,
				banner: request.sender.banner,
				bio: request.sender.bio,
				created_at: request.sender.created_at,
			},
			request_since: request.created_at
		}));

		const outgoing = outgoingPendingRequests.map(request => ({
			type: 'outgoing',
			user: {
				id: request.receiver.id,
				name: request.receiver.name,
				picture: request.receiver.picture,
				banner: request.receiver.banner,
				bio: request.receiver.bio,
				created_at: request.receiver.created_at,
			},
			request_since: request.created_at
		}));

		return reply.status(200).send({
			incoming,
			outgoing
		});
	} catch (error) {
		console.error("Error server:", error);
		return reply.status(500).send({ error: "Erreur serveur." });
	}
}
