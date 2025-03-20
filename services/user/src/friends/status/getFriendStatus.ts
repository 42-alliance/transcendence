import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../index.js";
import { extractUserId } from "../../utils.js";
import { Type } from "@sinclair/typebox";

export const getFriendStatusSchema = {
	headers: Type.Object({
		"x-user-id": Type.String({ pattern: "^[0-9]+$" }),
	}),
	params: Type.Object({
		friendId: Type.String({ pattern: "^[0-9]+$" }),
	})
};

export async function getFriendStatus(request: FastifyRequest<{ Params: { friendId: string } }>, reply: FastifyReply) {
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
