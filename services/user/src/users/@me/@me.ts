import { FastifyInstance, FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import { prisma } from "../../index.js";
import { extractUserId } from "../../utils.js"
import { Type } from "@sinclair/typebox";

export const meSchema: FastifySchema = {
	headers: Type.Object({
		"x-user-id": Type.String({ pattern: "^[0-9]+$" }),
	})
};

export async function me(request: FastifyRequest, reply: FastifyReply): Promise<object[]> {
    const userId = extractUserId(request);

    try {
        const me = await prisma.users.findUnique({
            where: {
                id: userId,
            },
        });

        if (!me) {
            return reply.status(404).send({message: "User not found"});
        }

        const friendsList = await prisma.friends.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ],
                status: "accepted"
            },
            include: {
                receiver: true,
                sender: true
            }
        });

        const friends = friendsList.map(friendship => {
            const friend = friendship.senderId === userId ? friendship.receiver : friendship.sender;
            return {
                id: friend.id,
                name: friend.name,
                picture: friend.picture,
				bio: friend.bio,
				banner: friend.banner,
                created_at: friend.created_at
            };
        });

        return reply.status(200).send({
			id: me.id,
			name: me.name,
			picture: me.picture,
            email: me.email,
			banner: me.banner,
			bio: me.bio,
			last_seen: me.lastSeen,
			status: me.is_online,
			created_at: me.created_at,
			friends: friends
        });
    } catch (e) {
        return reply.status(500).send({error: e});
    }
}