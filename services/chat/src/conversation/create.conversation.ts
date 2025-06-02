import { FastifyInstance, FastifyRequest, FastifyReply, FastifySchema } from 'fastify';
import { User } from '../types.js';
import { checkIfUserExist, extractUserIdHeader } from '../utils.js';
import { prisma } from '../index.js';
import { Type } from '@sinclair/typebox'

export const createConversationSchema = {
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

function createConversationName(users: User[], adminId: number): string {
	let str = "";

	users.forEach(user => {
		if (user.id !== adminId) {
			str += user.name + ', ';
		}
	});

	const members = str.slice(0, -2).split(', '); // Enlever la dernière virgule et l'espace
	if (members.length === 1) {
		return members[0]; // Si un seul membre, retourner son nom
	}
	return members.slice(0, -1).join(', ') + ' and ' + members[members.length - 1]; // Formater comme "A, B and C"
}


export async function createConversation(server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
	try {
		const adminId = extractUserIdHeader(request);

		const { members, name, isGroup } = request.body as { 
			members: string[],
			name?: string,
			isGroup?: boolean 
		};
  
	  	let users: User[] = [];
		let userIDs: number[] = [];
	  
		// Vérifier si tous les membres existent
		for (const member of members) {
			const user = await checkIfUserExist(member, adminId);
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

		// Créer la conversation dans la base de données
		const conversation = await prisma.conversation.create({
			data: {
				name: name || createConversationName(users, adminId),
				isGroup: isGroup || members.length > 2,
			},
		});

  
		const memberPromises = users.map(user => {
			return prisma.conversationMember.create({
				data: {
					userId: user.id,
					name: user.name,
					conversationId: conversation.id,
					isAdmin: user.id === adminId,
				},
			});
		});
		
	
		// Attendre que tous les membres soient ajoutés
		await Promise.all(memberPromises);
	
		// Récupérer la conversation complète avec ses membres
		const completeConversation = await prisma.conversation.findUnique({
			where: {
				id: conversation.id,
			},
			include: {
				members: true,
			}
		});
	
		return reply.status(201).send({ 
			message: "Discussion créée avec succès",
			conversation: completeConversation
		});
	} catch (error) {
		console.error("❌ Erreur lors de la création de la discussion :", error);
		return reply.status(400).send({ error: "Impossible de créer la discussion." });
	}
}