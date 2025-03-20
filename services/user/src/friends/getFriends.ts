import { FastifyInstance, FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import { prisma } from "../index.js";
import { extractUserId } from "../utils.js"
import { Type } from '@sinclair/typebox'

export const getFriendsSchema: FastifySchema = {
	headers: Type.Object({
		"x-user-id": Type.String({ pattern: "^[0-9]+$" }),
	}),
};

export async function getFriends(request: FastifyRequest, reply: FastifyReply) {
    try {
        const userId = extractUserId(request);

        const acceptedFriends = await prisma.$transaction([
            // L'utilisateur a envoyé la demande d'amitié
            prisma.friends.findMany({
                where: {
                    senderId: userId,
                    status: 'accepted'
                },
                include: {
                    receiver: {
                        select: {
                            id: true,
                            name: true,
                            picture: true
                        }
                    }
                }
            }),
        
            // L'utilisateur a reçu la demande d'amitié
            prisma.friends.findMany({
                where: {
                    receiverId: userId,
                    status: 'accepted'
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            picture: true
                        }
                    }
                }
            })
        ]);

        // Uniformisation de la sortie
        const friendsList = [
            ...acceptedFriends[0].map(friend => ({
                friend: {
                    id: Number(friend.receiver.id),
                    name: friend.receiver.name,
                    picture: friend.receiver.picture
                },
                relation_id: friend.id,
                created_at: friend.created_at
            })),
            ...acceptedFriends[1].map(friend => ({
                friend: {
                    id: Number(friend.sender.id),
                    name: friend.sender.name,
                    picture: friend.sender.picture
                },
                relation_id: friend.id,
                created_at: friend.created_at
            }))
        ];

        // Tri par `friend.name`
        const sortedFriendsList = friendsList.sort((a, b) => a.friend.name.localeCompare(b.friend.name));

        return reply.status(200).send(sortedFriendsList);
    } catch (error) {
        console.error("Error server:", error);
        return reply.status(500).send({ error: "Erreur serveur." });
    }
}
