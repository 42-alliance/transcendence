import { FastifyInstance } from "fastify";
import { createDiscussion, createDiscussionSchema } from "./discussion/create.discussion.js";


export function setupChatRoutes(server: FastifyInstance) {
	server.post("/chat/create", { schema: createDiscussionSchema }, async function handler(request, reply) {
		await createDiscussion(server, request, reply);
	});
}