import { FastifyRequest, FastifyReply } from "fastify";
import { extractUserIdHeader, getUserById } from "../utils";
import { prisma } from "..";

export async function deleteConversation(
  request: FastifyRequest<{ Params: { conversationId: string } }>,
  reply: FastifyReply,
) {
  try {
    const { conversationId } = request.params;

    const userId = extractUserIdHeader(request);

    const user = await getUserById(userId);

    const deletedConversation = await prisma.conversation.delete({
	  where: {
		id: Number(conversationId),
		members: {
		  some: {
			userId: user.id,
		  },
		},
	  },
    });

    reply.status(200).send(deletedConversation);
  } catch (error) {
    console.error("Error deleting conversation:", error);
    reply.status(500).send({ error: "Failed to delete conversation" });
  }
}
