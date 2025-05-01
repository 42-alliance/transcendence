import { FastifyInstance, FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import { prisma } from "../index.js";
import { extractUserId } from "../utils.js"
import { Type } from '@sinclair/typebox'

export const removeFriendSchema: FastifySchema = {
	headers: Type.Object({
		"x-user-id": Type.String({ pattern: "^[0-9]+$" }),
	}),
	params: Type.Object({
		friendId: Type.String({ pattern: "^[0-9]+$" }),
	})
};

export async function removeFriend(request: FastifyRequest<{ Params: { friendId: string } }>, reply: FastifyReply) {
	const { friendId } = request.params;
	const userId = extractUserId(request);
	
	const fID = Number(friendId);
  
	try {
	  const query = await prisma.friends.deleteMany({
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
  
	  if (query.count === 0) {
		return reply.status(400).send({ message: "Relation not found in database" });
	  }
  
	  return { message: "Friend deleted successfully" };
	} catch (error) {
	  console.error("Error server:", error);
	  return reply.status(500).send({ message: "Internal server error" });
	}
}