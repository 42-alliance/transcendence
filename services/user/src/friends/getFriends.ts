import { FastifyInstance, FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import { prisma } from "../index.js";
import { extractUserId } from "../utils.js"
import { Type } from '@sinclair/typebox'
// import { time } from "console";

export const getFriendsSchema: FastifySchema = {
	headers: Type.Object({
		"x-user-id": Type.String({ pattern: "^[0-9]+$" }),
	}),
};

export async function getFriends(request: FastifyRequest, reply: FastifyReply) {
    try {
        const userId = extractUserId(request);

        const me = await prisma.users.findUnique({
            where: {
                id: userId,
            }
        });

        if (!me) {
            return reply.status(404).send({ message: "User not found" });
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
            let delta = Date.now() - friend.lastSeen.getTime();
			
            return {
                id: friend.id,
                name: friend.name,
                picture: friend.picture,
				bio: friend.bio,
				banner: friend.banner,
                created_at: friend.created_at,
				status: friend.is_online === "online" && delta < 10 * 60 * 1000 ? "online" : friend.is_online === "offline" ? "offline" : "away",
            };
        });

        return reply.status(200).send(friends);
    } catch (error) {
        console.error("Error server:", error);
        return reply.status(500).send({ error: "Erreur serveur." });
    }
}

