import { FastifyInstance } from "fastify";
import { createConversation, createConversationSchema } from "./conversation/create.conversation.js";
import { getMessages } from "./message/get.message.js";
import { getAllConversations } from "./conversation/getAll.conversation.js";


export function setupChatRoutes(server: FastifyInstance) {
	server.post("/chat/create", { schema: createConversationSchema }, async function handler(request, reply) {
		await createConversation(server, request, reply);
	});

	server.get("/chat/discussion/", async function handler(request, reply) {
		await getAllConversations(server, request, reply);
	});

	server.get<{Params: { conversationId: string }}>("/chat/discussion/:conversationId", async function handler(request, reply) {
		await getMessages(server, request, reply);
	});
}