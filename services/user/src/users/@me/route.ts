import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../index.js";
import { extractUserId } from "../../utils.js"

export async function me(server:FastifyInstance, request: FastifyRequest, reply: FastifyReply): Promise<object[]> {
    const id = extractUserId(request);
    try {
        const me = await prisma.users.findUnique({
            where: {
                id: id,
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
            return reply.status(400).send({error: "User not found"});
        }

        const friendsList = [
            ...me.sentRequests
            .filter(friend => friend.receiver.id !== id)
            .map(friend => ({
                id: friend.receiver.id,
                name: friend.receiver.name,
                picture: friend.receiver.picture,
                relation_id: friend.id,
                status: friend.status,
                type: "sent"  
            })),
            ...me.receivedRequests
            .filter(friend => friend.sender.id !== id)
            .map(friend => ({
                id: friend.sender.id,
                name: friend.sender.name,
                picture: friend.sender.picture,
                relation_id: friend.id,
                status: friend.status,
                type: "received"
            }))
        ];

        return reply.status(200).send({
			id: me.id,
			name: me.name,
			picture: me.picture,
			created_at: me.created_at,
			friends: friendsList
        });
    } catch (e) {
        return reply.status(500).send({error: e});
    }
}