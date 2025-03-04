import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../index.js";
import { extractUserId } from "../../utils.js";

const StatusEnum = {
	pending: 'pending',
	accepted: 'accepted',
	rejected: 'rejected',
	blocked: 'blocked',
};

export async function getFriendStatus(server: FastifyInstance, request: FastifyRequest<{ Params: { friendId: string } }>, reply: FastifyReply) {
	const { friendId } = request.params; // Récupérez friendId depuis les paramètres de l'URL
	const userId = extractUserId(request);
  
	// Validation de l'ID de l'ami
	const fID = Number(friendId);
	if (isNaN(fID)) {
	  return reply.status(400).send({ error: "Invalid friend ID" });
	}
  
	try {
	  const friends = await prisma.friends.findMany({
		where: {
		  OR: [
			{
			  senderId: userId,
			  receiverId: fID,
			},
			{
			  senderId: fID,
			  receiverId: userId,
			},
		  ],
		},
	  });
  
	  if (friends.length !== 1) {
		return reply.status(400).send({ error: "Bad request" });
	  }
  
	  return reply.status(200).send({ status: friends[0].status });
	} catch (error) {
	  console.error("Error server:", error);
	  return reply.status(500).send({ error: "Internal server error" });
	}
}

export async function updateFriendStatus(server: FastifyInstance, request: FastifyRequest<{Params: { friendId: string }}>, reply: FastifyReply) {
    const { friendId } = request.params;
	const userId = extractUserId(request);
    const { status } = request.body as { status: string };

	if (!Object.values(StatusEnum).includes(status)) {
		return reply.status(400).send({ error: 'Error: invalid status' });
	}
	
	const fID = parseInt(friendId);
	
    try {
		const query = await prisma.friends.update({
			where: {
				id: fID
			},
			data: {
				status: status as keyof typeof StatusEnum,
			},
		});
		
		if (!query) {
			return reply.status(400).send({ message: "Relation not found in database" });
		}

        console.log(`Demande d'ami entre ${userId} et ${friendId} est maintenant ${status}.`);

        return reply.status(200).send({ message: `Friend request is now ${status}` });
    } catch (error) {
        console.error("Error server:" + error);
        return reply.status(500).send({ error: error });
    }
}