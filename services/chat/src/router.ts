import { FastifyInstance } from "fastify";
import { createDiscussion, createDiscussionSchema } from "./discussion/create.discussion.js";
import { getMessages } from "./message/get.message.js";


export function setupChatRoutes(server: FastifyInstance) {
	server.post("/chat/create", { schema: createDiscussionSchema }, async function handler(request, reply) {
		await createDiscussion(server, request, reply);
	});

	server.get<{Params: { conversationId: string }}>("/chat/discussion/:conversationId", async function handler(request, reply) {
		await getMessages(server, request, reply);
	})
}