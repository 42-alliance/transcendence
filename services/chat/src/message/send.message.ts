import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../index.js';
import { checkIfUserExist } from '../utils.js';
import { WebSocketMessage } from '../types.js';

// Route pour envoyer un message dans une discussion
export async function storeMessage(sender: number, data: WebSocketMessage) {
	
	if (!data.type || !data.content || !data.conversationId) {
		throw new Error("Message format not good");
	}
		
	if (data.content.trim() === '') {
		throw new Error("Le message ne peut pas être vide.");
	}
	
	// Vérifier si l'utilisateur est membre de la conversation
	const membership = await prisma.conversationMember.findUnique({
		where: {
			userId_conversationId: {
				userId: sender,
				conversationId: data.conversationId
			}
		}
	});
	
	if (!membership) {
		throw new Error("Vous n'êtes pas membre de cette conversation.");
	}
  
	  // Créer le message
	let message;
	if (data.type === "new_message") {
		message = await prisma.message.create({
			data: {
				content: data.content,
				userId: sender,
				name: membership.name,
				picture: membership.picture,
				conversationId: data.conversationId
			}
		});
	}
	else if (data.type === "invitation_game") {
		message = await prisma.message.create({
			data: {
				expiredAt: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes expiration
				isEphemeral: true,
				content: data.content,
				userId: sender,
				name: membership.name,
				picture: membership.picture,
				conversationId: data.conversationId
			}
		});
	} else {
		throw new Error("Type de message inconnu.");
	}
	return  {message: message, type: data.type};
}