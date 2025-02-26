import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../index.js";
import { extractUserId } from "../../utils.js"

export async function me(server:FastifyInstance, request: FastifyRequest, reply: FastifyReply): Promise<object[]> {
    const id = extractUserId(request);
    try {
        const me = await prisma.users.findUnique({
            where: {
                id: id,
            }
        });
        if (!me) {
            return reply.status(400).send({error: "User not found"});
        }
        return reply.status(200).send({user: me});
    } catch (e) {
        return reply.status(500).send({error: e});
    }
}