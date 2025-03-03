import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../index.js";
import { extractUserId } from "../../utils.js";

export async function getPendingFriendRequest(server: FastifyInstance, request: FastifyRequest,reply: FastifyReply) {

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
			id: request.sender.id,
			name: request.sender.name,
			picture: request.sender.picture
		}));

        return reply.status(200).send(requestSenders);
    } catch (error) {
        console.error("Error server:", error);
        return reply.status(500).send({ error: "Erreur serveur." });
    }
}
