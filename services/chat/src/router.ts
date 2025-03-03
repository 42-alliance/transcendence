import { FastifyInstance } from "fastify";
import { createConversation, createConversationSchema } from "./conversation/create.conversation.js";
import { getMessages } from "./message/get.message.js";
import { getAllConversations, getAllConversationsSchema } from "./conversation/getAll.conversation.js";


export function setupChatRoutes(server: FastifyInstance) {
	server.post("/chat/create", { schema: createConversationSchema }, async function handler(request, reply) {
		await createConversation(server, request, reply);
	});

	server.get("/chat/conversations", { schema: getAllConversationsSchema }, async function handler(request, reply) {
		await getAllConversations(server, request, reply);
	});

	server.get<{Params: { conversationId: string }}>("/chat/conversations/:conversationId", async function handler(request, reply) {
		await getMessages(server, request, reply);
	});
}