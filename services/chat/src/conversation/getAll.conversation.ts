import { FastifyInstance, FastifyRequest, FastifyReply, FastifySchema } from 'fastify';
import { prisma } from '../index.js';
import { extractUserIdHeader } from '../utils.js';
import { Type } from "@sinclair/typebox"

export const getAllConversationsSchema: FastifySchema = {
    headers: Type.Object({
        "x-user-id": Type.String({ pattern: "^[0-9]+$" }),
    })
};

export async function getAllConversations(
    server: FastifyInstance,
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const userId = extractUserIdHeader(request);

        // 1. On récupère toutes les conversations et le dernier message de chaque
        const conversations = await prisma.conversation.findMany({
            where: {
                members: {
                    some: { userId: userId }
                }
            },
            include: {
                members: true,
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1
                }
            }
        });

        // 2. On récupère le nombre de messages non lus pour chaque conversation
        const unreadCounts = await prisma.message.groupBy({
            by: ['conversationId'],
            where: {
                conversationId: {
                    in: conversations.map(c => c.id)
                },
                // Exclut les messages déjà lus par cet utilisateur
                readBy: {
                    none: { userId: userId }
                }
            },
            _count: {
                id: true
            }
        });

        // 3. Indexation du nombre de messages non lus par conversationId
        const unreadMap = Object.fromEntries(
            unreadCounts.map(row => [row.conversationId, row._count.id])
        );

        // 4. Ajoute le nombre non lu dans chaque conversation
        const conversationsWithUnread = conversations.map(conv => ({
            ...conv,
            unreadCount: unreadMap[conv.id] || 0
        }));

        // Trie par dernier message
        conversationsWithUnread.sort((a, b) => {
            const aDate = a.messages[0]?.createdAt ? new Date(a.messages[0].createdAt).getTime() : 0;
            const bDate = b.messages[0]?.createdAt ? new Date(b.messages[0].createdAt).getTime() : 0;
            return bDate - aDate;
        });

        return reply.status(200).send(conversationsWithUnread);

    } catch (error) {
        console.error("❌ Erreur lors de la récupération des conversations :", error);
        return reply.status(500).send({ error: "Impossible de récupérer les conversations." });
    }
}
