import { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import { extractUserId } from "../../utils.js";
import { Type } from "@sinclair/typebox";
import { prisma } from "../../index.js";

export const getSendFriendRequestSchema: FastifySchema = {
	headers: Type.Object({
		"x-user-id": Type.String({ pattern: "^[0-9]+$" }),
	}),
}

export async function getSendFriendRequest(request: FastifyRequest, reply: FastifyReply) {
	try {
		const userId = extractUserId(request);

		const sendRequests = await prisma.friends.findMany({
			where: {
				senderId: userId,
				status: "pending",
			},
			include: {
				receiver: true
			},
		});

		const requestReceivers = sendRequests.map(request => ({
			receiver: {
				id: request.receiver.id,
				name: request.receiver.name,
				picture: request.receiver.picture,
				banner: request.receiver.banner,
				bio: request.receiver.bio,
				created_at: request.receiver.created_at,
			},
			request_sinced: request.created_at 
		}));

		reply.status(200).send(requestReceivers);
	} catch (error) {
		console.error("Error getSendFriendRequest: ", error);
		reply.status(500).send({ message: `Error ${error}`});
	}
}
