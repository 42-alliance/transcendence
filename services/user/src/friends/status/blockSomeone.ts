import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../index.js";
import { extractUserId } from "../../utils.js";

export async function blockSomeone(
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
      return reply.status(400).send({ message: "You cannot block yourself." });
    }

    await prisma.blockedId.create({
      data: {
        userId: userId,
        blockedId: friendId,
      },
    });
    await prisma.friends.deleteMany({
      where: {
        OR: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId },
        ],
      },
    });
    return reply.status(200).send({ message: "User blocked successfully." });
  } catch (error) {
    console.error("Error blocking user:", error);
    return reply.status(500).send({ message: "Internal server error." });
  }
}
