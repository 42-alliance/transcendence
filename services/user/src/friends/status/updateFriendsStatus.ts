import { Type } from "@sinclair/typebox";
import { connectedSockets, prisma } from "../../index.js";
import { extractUserId } from "../../utils.js";
import { FastifyReply, FastifyRequest, FastifyInstance, FastifySchema } from "fastify";
import { connect } from "http2";

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
		const me = await prisma.users.findUnique({
			where: { id: userId },
			select: { id: true, name: true, picture: true }
		});
		if (!me) {
			return reply.status(404).send({ message: "User not found" });
		}

		const friend = await prisma.users.findUnique({
			where: { id: friendID },
			select: { id: true, name: true, picture: true }
		});
		if (!friend) {
			return reply.status(404).send({ message: "Friend not found" });
		}

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

		connectedSockets.get(friendship.senderId)?.forEach(socket => {
			if (socket.readyState === socket.OPEN) {
				socket.send(JSON.stringify({
					type: "friendship_status_update",
					data: {
						friendshipId: friendship.id,
						status: status,
						friend: {
							id: friend.id,
							name: friend.name,
							picture: friend.picture,
						},
					}
				}));
			}
		});

        console.log(`Friend request between ${friendship.senderId} and ${friendship.receiverId} is now ${status}.`);

        return reply.status(200).send({ message: `Friend request is now ${status}` });
    } catch (error) {
        console.error("Server error:", error);
        return reply.status(500).send({ error: "Internal server error" });
    }
}
