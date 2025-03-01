import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../index.js';
import { extractUserIdHeader, getUserById } from '../utils.js';

export async function getAllConversations(server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
	try {
		const userId = extractUserIdHeader(request);

		const conversations = await prisma.conversation.findMany({
			where: {
				members: {
					some: { userId: userId }
				}
			},
			include: {
				members: true, // Inclure les membres de la conversation
				messages: {
					orderBy: { createdAt: "desc" }, // Trier par date décroissante
					take: 1 // Prendre le dernier message
				}
			}
		});

		return reply.status(200).send({ conversations });
	} catch (error) {
		console.error("❌ Erreur lors de la récupération des conversations :", error);
		return reply.status(500).send({ error: "Impossible de récupérer les conversations." });
	}
}
