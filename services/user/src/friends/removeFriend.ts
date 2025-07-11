import { FastifyInstance, FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import { connectedSockets, prisma } from "../index.js";
import { extractUserId } from "../utils.js"
import { Type } from '@sinclair/typebox'
import { connect } from "http2";

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
	  
	  connectedSockets.get(fID)?.forEach((socket) => {
		if (socket.readyState === socket.OPEN) {
		  socket.send(JSON.stringify({
			type: "friend_removed",
			data: {
				friend_id: userId,
			}
		  }));
		}
	  });

	  return { message: "Friend deleted successfully" };
	} catch (error) {
	  console.error("Error server:", error);
	  return reply.status(500).send({ message: "Internal server error" });
	}
}