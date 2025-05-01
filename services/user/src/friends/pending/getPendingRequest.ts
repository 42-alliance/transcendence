import { FastifyInstance, FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import { prisma } from "../../index.js";
import { extractUserId } from "../../utils.js";
import { Type } from '@sinclair/typebox'

export const getPendingFriendRequestSchema: FastifySchema = {
	headers: Type.Object({
		"x-user-id": Type.String({ pattern: "^[0-9]+$" }),
	}),
};

export async function getPendingFriendRequest(request: FastifyRequest,reply: FastifyReply) {

	const userId = extractUserId(request);

    console.log("Getting pending requests for user:", userId);

    try {
		const incomingPendingRequests = await prisma.friends.findMany({
			where: {
			  receiverId: userId,
			  status: 'pending'
			},
			include: {
			  sender: true
			}
		});
		  
		const requestSenders = incomingPendingRequests.map(request => ({
			sender: {
				id: request.sender.id,
				name: request.sender.name,
				picture: request.sender.picture,
				banner: request.sender.banner,
				bio: request.sender.bio,
				created_at: request.sender.created_at,
			},
			request_sinced: request.created_at
		}));

        return reply.status(200).send(requestSenders);
    } catch (error) {
        console.error("Error server:", error);
        return reply.status(500).send({ error: "Erreur serveur." });
    }
}
