import { Type } from "@sinclair/typebox";
import { prisma } from "../../index.js";
import { extractUserId } from "../../utils.js";
import { FastifyReply, FastifyRequest, FastifyInstance, FastifySchema } from "fastify";

const StatusEnum = {
	// pending: 'pending',
	accepted: 'accepted',
	rejected: 'rejected',
	blocked: 'blocked',
};

export const updateFriendStatusSchema: FastifySchema = {
	params: Type.Object({
		friendId: Type.String({ pattern: "^[0-9]+$" }),
	}),
	headers: Type.Object({
		"x-user-id": Type.String({ pattern: "^[0-9]+$" }),
	}),
	body: Type.Object({
		status: Type.Enum(StatusEnum),
	}),
};

export async function updateFriendStatus(request: FastifyRequest<{ Params: { friendId: string } }>, reply: FastifyReply) {
    const { friendId } = request.params;
    const userId = extractUserId(request);
    const { status } = request.body as { status: string };

    const friendID = parseInt(friendId);

    try {
        const friendship = await prisma.friends.findFirst({
            where: {
                OR: [
                    { senderId: userId, receiverId: friendID },
                    { senderId: friendID, receiverId: userId }
                ]
            }
        });

        if (!friendship) {
            return reply.status(404).send({ message: "Friendship relation not found" });
        }

		if (status === StatusEnum.rejected) {
			await prisma.friends.deleteMany({
				where: {
					senderId: friendship.senderId,
					receiverId: friendship.receiverId
				},
			});
		}
		else {
			await prisma.friends.updateMany({
				where: {
					senderId: friendship.senderId,
					receiverId: friendship.receiverId
				},
				data: {
					status: status as keyof typeof StatusEnum,
				}
			});
		}

        console.log(`Friend request between ${friendship.senderId} and ${friendship.receiverId} is now ${status}.`);

        return reply.status(200).send({ message: `Friend request is now ${status}` });
    } catch (error) {
        console.error("Server error:", error);
        return reply.status(500).send({ error: "Internal server error" });
    }
}
