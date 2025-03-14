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
            return reply.status(404).send({message: "User not found"});
        }

        const friendsList = [
            ...me.sentRequests
            .filter(friend => friend.receiver.id !== id)
            .map(friend => ({
                receiver_id: friend.receiver.id,
                receiver_name: friend.receiver.name,
                received_at: friend.created_at,
                picture: friend.receiver.picture,
                relation_id: friend.id,
                status: friend.status,
                type: "sent"  
            })),
            ...me.receivedRequests
            .filter(friend => friend.sender.id !== id)
            .map(friend => ({
                sender_id: friend.sender.id,
                sender_name: friend.sender.name,
        		sent_at: friend.created_at,
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
			banner: me.banner,
			bio: me.bio,
			created_at: me.created_at,
			friends: friendsList
        });
    } catch (e) {
        return reply.status(500).send({error: e});
    }
}