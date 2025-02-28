import { FastifyInstance, FastifyRequest, FastifyReply, FastifySchema } from 'fastify';
import { User } from '../types.js';
import { checkIfUserExist, extractUserIdHeader } from '../utils.js';
import { prisma } from '../index.js';
import { Type } from '@sinclair/typebox'

export const createDiscussionSchema = {
	body: Type.Object({
		members: Type.Array(Type.String(), { minItems: 2 }),
	}, { required: ["members"] })
}

/**
 * Vérifie si une conversation existe déjà avec les mêmes membres.
 * @param members Liste des IDs des membres de la conversation.
 * @returns L'ID de la conversation existante, ou `null` si aucune conversation n'existe.
 */
async function findExistingConversation(members: number[]): Promise<number | null> {
  const conversations = await prisma.conversation.findMany({
    where: {
      members: {
        some: {
          userId: {
            in: members,
          },
        },
      },
    },
    include: {
      members: true, // Inclure les membres de chaque conversation
    },
  });

  for (const conversation of conversations) {
    const conversationMemberIds = conversation.members.map(member => member.userId);

    if (conversationMemberIds.length === members.length && conversationMemberIds.every(id => members.includes(id))) {
      return conversation.id;
    }
  }
  return null;
}

export async function createDiscussion(server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
	try {
		const adminId = extractUserIdHeader(request);

		const { members, name, isGroup } = request.body as { 
			members: string[],
			name?: string,
			isGroup?: boolean 
		};
  
		// Vérifier qu'il y a au moins 2 membres pour créer une discussion
		if (!members || members.length < 2) {
			return reply.status(400).send({ error: "Une discussion doit contenir au moins 2 membres." });
		}
  
	  	let users: User[] = [];
		let userIDs: number[] = [];
	  
		// Vérifier si tous les membres existent
		for (const member of members) {
			const user = await checkIfUserExist(member);
			users.push(user);
			userIDs.push(user.id);
		}

		const existingConversationId = await findExistingConversation(userIDs);
		if (existingConversationId) {
		  return reply.status(200).send({ 
			message: "Une conversation existe déjà avec ces membres.",
			conversationId: existingConversationId,
		  });
		}

		console.log("users: ", users)
		console.error("-----TEST1-----");
		// Créer la conversation dans la base de données
		const conversation = await prisma.conversation.create({
			data: {
				name: name || null,
				isGroup: isGroup || members.length > 2,
			},
		});

		console.log("conversation.id: ", conversation.id);
		console.error("-----TEST2-----");
  
		const memberPromises = users.map(user => {
			console.log("userId == ", user.id)
			return prisma.conversationMember.create({
				data: {
					userId: user.id,
					conversationId: conversation.id,
					isAdmin: user.id === adminId,
				},
			});
		});
		console.error("-----TEST3-----");
	
		// Attendre que tous les membres soient ajoutés
		await Promise.all(memberPromises);
		console.error("-----TEST4-----");
	
		// Récupérer la conversation complète avec ses membres
		const completeConversation = await prisma.conversation.findUnique({
			where: {
				id: conversation.id,
			},
			include: {
				members: true,
			}
		});
		console.error("-----TEST5-----");
	
		return reply.status(201).send({ 
			message: "Discussion créée avec succès",
			conversation: completeConversation
		});
	} catch (error) {
		console.error("❌ Erreur lors de la création de la discussion :", error);
		return reply.status(400).send({ error: "Impossible de créer la discussion." });
	}
}