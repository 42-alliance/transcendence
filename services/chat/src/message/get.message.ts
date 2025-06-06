import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../index.js';
import { extractUserIdHeader, getUserById } from '../utils.js';

export async function getMessages(server: FastifyInstance, request: FastifyRequest<{Params: { conversationId: string }}>, reply: FastifyReply) {
	try {
		const { conversationId } = request.params;

		const userId = extractUserIdHeader(request);

	  	const user = await getUserById(userId)

	  // Vérifier si l'utilisateur est membre de la conversation
		const membership = await prisma.conversationMember.findUnique({
			where: {
				userId_conversationId: {
					userId: user.id,
					conversationId: Number(conversationId),
				}
			}
		});
  
		if (!membership) {
			return reply.status(403).send({ error: "Vous n'êtes pas membre de cette conversation." });
		}
  
  
	  // Récupérer les messages avec pagination
		const messages = await prisma.message.findMany({
			where: {
				conversationId: Number(conversationId),
			},
			orderBy: {
				createdAt: 'desc' // Messages les plus récents d'abord
			},
			include: {
				conversation: {
					select: {
						id: true,
						name: true,
						members: {
							select: {
								userId: true,
								name: true,
								picture: true,
							}
						}
					}
				},
				readBy: true // Inclure les informations de lecture
			}
		});
  
		return reply.status(200).send(messages);
	} catch (error) {
		console.error("❌ Erreur lors de la récupération des messages :", error);
		return reply.status(400).send({ error: "Impossible de récupérer les messages." });
	}
}