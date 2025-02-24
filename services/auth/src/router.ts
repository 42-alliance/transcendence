import { FastifyInstance } from "fastify";
import { authCallback } from "./callback/route.js";
import { authRedirect } from "./redirect/route.js";
import { refreshJWT } from "./jwt/refresh/route.js";
import { refreshJWTSchema } from "./jwt/refresh/schema.js";

export async function setAuthRoutes(server: FastifyInstance) {
	server.get('/auth/redirect', async function handler(request, reply) {
		return await authRedirect(server, request, reply);
	});

	server.get('/auth/callback', async function handler(request, reply) {
		return await authCallback(server, request, reply);
	});

	server.post('/auth/jwt/refresh', { schema: refreshJWTSchema}, async function handler(request, reply) {
		return await refreshJWT(server, request, reply);
	});
}

