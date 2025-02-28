// import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
// import { config } from '../config.js';
// import { prisma } from '../index.js';
// import { User } from '../types.js';
// import { checkIfUserExist } from '../utils.js';


// // Route pour récupérer les messages d'une discussion
// export async function getMessages(server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
//   try {
//     const { conversationId } = request.params as { conversationId: string };
//     const { userId } = request.query as { userId: string };
//     const { page = 1, limit = 20 } = request.query as { page?: number, limit?: number };

//     // Vérifier si l'utilisateur existe
//     const user = await checkIfUserExist(userId);

//     // Vérifier si l'utilisateur est membre de la conversation
//     const membership = await prisma.conversationMember.findUnique({
//       where: {
//         userId_conversationId: {
//           userId: user.id,
//           conversationId
//         }
//       }
//     });

//     if (!membership) {
//       return reply.status(403).send({ error: "Vous n'êtes pas membre de cette conversation." });
//     }

//     // Calculer l'offset pour la pagination
//     const skip = (page - 1) * limit;

//     // Récupérer les messages avec pagination
//     const messages = await prisma.message.findMany({
//       where: {
//         conversationId
//       },
//       orderBy: {
//         createdAt: 'desc' // Messages les plus récents d'abord
//       },
//       skip,
//       take: limit,
//       include: {
//         sender: true, // Inclure les informations sur l'expéditeur
//         readBy: true // Inclure les informations de lecture
//       }
//     });

//     // Compter le nombre total de messages pour la pagination
//     const totalMessages = await prisma.message.count({
//       where: {
//         conversationId
//       }
//     });

//     return reply.status(200).send({
//       data: messages,
//       pagination: {
//         total: totalMessages,
//         page,
//         limit,
//         pages: Math.ceil(totalMessages / limit)
//       }
//     });
//   } catch (error) {
//     console.error("❌ Erreur lors de la récupération des messages :", error);
//     return reply.status(400).send({ error: "Impossible de récupérer les messages." });
//   }
// }

// // Marquer un message comme lu
// export async function markMessageAsRead(server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
//   try {
//     const { messageId } = request.params as { messageId: string };
//     const { userId } = request.body as { userId: string };

//     // Vérifier si l'utilisateur existe
//     const user = await checkIfUserExist(userId);

//     // Vérifier si le message existe et récupérer sa conversation
//     const message = await prisma.message.findUnique({
//       where: { id: messageId },
//       include: { conversation: true }
//     });

//     if (!message) {
//       return reply.status(404).send({ error: "Message non trouvé." });
//     }

//     // Vérifier si l'utilisateur est membre de la conversation
//     const membership = await prisma.conversationMember.findUnique({
//       where: {
//         userId_conversationId: {
//           userId: user.id,
//           conversationId: message.conversationId
//         }
//       }
//     });

//     if (!membership) {
//       return reply.status(403).send({ error: "Vous n'êtes pas membre de cette conversation." });
//     }

//     // Créer ou mettre à jour l'entrée de lecture
//     const messageRead = await prisma.messageRead.upsert({
//       where: {
//         messageId_userId: {
//           messageId,
//           userId: user.id
//         }
//       },
//       update: {
//         readAt: new Date()
//       },
//       create: {
//         messageId,
//         userId: user.id
//       }
//     });

//     return reply.status(200).send({
//       message: "Message marqué comme lu",
//       data: messageRead
//     });
//   } catch (error) {
//     console.error("❌ Erreur lors du marquage du message comme lu :", error);
//     return reply.status(400).send({ error: "Impossible de marquer le message comme lu." });
//   }
// }
