import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../index.js";
import { extractUserId } from "../../utils.js";

export async function unblockSomeone(
  request: FastifyRequest<{ Params: { friendId: string } }>,
  reply: FastifyReply,
) {
  try {
    const userId = extractUserId(request);

    const friendId = parseInt(request.params.friendId);
    if (isNaN(friendId)) {
      return reply.status(400).send({ message: "Invalid friend ID." });
    }

    const friend = await prisma.users.findUnique({
      where: { id: friendId },
      select: { id: true, name: true, picture: true },
    });

    if (!friend) {
      return reply.status(404).send({ message: "Friend not found." });
    }

    if (userId === friendId) {
      return reply
        .status(400)
        .send({ message: "You cannot unblock yourself." });
    }

    await prisma.blockedId.deleteMany({
      where: {
        userId: userId,
        blockedId: friendId,
      },
    });
    return reply.status(200).send({ message: "User unblocked successfully." });
  } catch (error) {
    console.error("Error unblocking user:", error);
    return reply.status(500).send({ message: "Internal server error." });
  }
}
