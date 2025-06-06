import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../index.js';
import { checkIfUserExist } from '../utils.js';
import { WebSocketMessage } from '../types.js';

// Route pour envoyer un message dans une discussion
export async function storeMessage(sender: number, data: WebSocketMessage) {
	
	if (!data.content || !data.conversationId) {
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
	const message = await prisma.message.create({
		data: {
			content: data.content,
			userId: sender,
			picture: membership.picture,
			conversationId: data.conversationId
		}
	});
	return  message;
}