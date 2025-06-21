import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../index.js";
import { extractUserIdHeader } from "../utils.js";


export async function deleteUserChat(
	request: FastifyRequest,
	reply: FastifyReply
) {
	try {
		const userId = extractUserIdHeader(request);

		await prisma.conversationMember.updateMany({
			where: {
				userId: userId,
			},
			data: {
				name: "User Deleted",
				picture: "/assets/default.jpeg",
			},
		});

		await prisma.message.deleteMany({
			where: {
				userId: userId,
			},
		});			

		return reply.status(200).send({ message: "User removed from conversation successfully" });
	} catch (error) {
		console.error("Error deleting user from conversation:", error);
		return reply.status(500).send({ error: "Internal server error" });
	}
}

