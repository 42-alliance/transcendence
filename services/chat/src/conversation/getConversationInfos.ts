import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../index.js";

export async function getConversationInfos(request: FastifyRequest<{ Params: { conversationId: string } }>, reply: FastifyReply) {
	const { conversationId } = request.params;

	if (!conversationId) {
		reply.status(400).send({ error: "Conversation ID is required" });
		return;
	}

	try {
		const conversation = await prisma.conversation.findUnique({
			where: { id: Number(conversationId) },
			select: {
				id: true,
				name: true,
				isGroup: true,
				members: true,
			},
		});

		if (!conversation) {
			reply.status(404).send({ error: "Conversation not found" });
			return;
		}

		reply.send(conversation);
	} catch (error) {
		console.error("Error fetching conversation infos:", error);
		reply.status(500).send({ error: "Internal server error" });
	}
}
