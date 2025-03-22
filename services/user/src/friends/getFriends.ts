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

        const me = await prisma.users.findUnique({
            where: {
                id: userId,
            },
            include: {
                sentRequests: {
                    include: {
                        receiver: true
                    }
                },
                receivedRequests: {
                    include: {
                        sender: true
                    }
                }
            }
        });

        if (!me) {
            return reply.status(404).send({ message: "User not found" });
        }

        const friendsList = [
            ...me.sentRequests
                .filter(friend => friend.receiver.id !== userId)
                .map(friend => ({
                    id: friend.receiver.id,
                    name: friend.receiver.name,
                    date: friend.created_at,
                    receiver_id: friend.receiver.id,
                    receiver_name: friend.receiver.name,
                    received_at: friend.created_at,
                    picture: friend.receiver.picture,
                    relation_id: friend.id,
                    status: friend.status,
                    type: "sent"
                })),
            ...me.receivedRequests
                .filter(friend => friend.sender.id !== userId)
                .map(friend => ({
                    id: friend.sender.id,
                    name: friend.sender.name,
                    date: friend.created_at,
                    sender_id: friend.sender.id,
                    sender_name: friend.sender.name,
                    sent_at: friend.created_at,
                    picture: friend.sender.picture,
                    relation_id: friend.id,
                    status: friend.status,
                    type: "received"
                }))
        ];

        return reply.status(200).send(friendsList);
    } catch (error) {
        console.error("Error server:", error);
        return reply.status(500).send({ error: "Erreur serveur." });
    }
}
