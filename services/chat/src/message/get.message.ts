import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../index.js';
import { extractUserIdHeader, getUserById } from '../utils.js';

export async function getMessages(request: FastifyRequest<{Params: { conversationId: string }}>, reply: FastifyReply) {
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
  
		await prisma.message.deleteMany({
			where: {
				conversationId: Number(conversationId),
				expiredAt: {
					lte: new Date() // Supprimer les messages expirés
				},
				isEphemeral: true // Ne supprimer que les messages éphémères
			}
		});
		
	  // Récupérer les messages avec pagination
		const messages = await prisma.message.findMany({
			where: {
				conversationId: Number(conversationId),
			},
			orderBy: {
				createdAt: 'desc' // Messages les plus récents d'abord
			},
			select: {
				id: true,
				userId: true,
				createdAt: true,
				content: true,
				conversationId: true,
				name: true,
				picture: true,
				readBy: true,
				conversation: {
					select: {
						id: true,
						name: true,
						isGroup: true,
						members: {
							select: {
								userId: true,
								name: true,
								picture: true,
							}
						}
					}
				},
			},
		});
  
		// Après avoir récupéré les messages :
		const unreadMessages = messages.filter(msg =>
      		!msg.readBy.some((read) => read.userId === user.id)
    	);

		if (unreadMessages.length > 0) {
			await prisma.messageRead.createMany({
				data: unreadMessages.map(msg => ({
					messageId: msg.id,
					userId: user.id,
				})),
			});
		}

		return reply.status(200).send(messages);
	} catch (error) {
		console.error("❌ Erreur lors de la récupération des messages :", error);
		return reply.status(400).send({ error: "Impossible de récupérer les messages." });
	}
}