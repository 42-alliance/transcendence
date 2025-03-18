import { FastifyInstance } from "fastify";
import { authCallback } from "./callback/route.js";
import { authRedirect } from "./redirect/route.js";
import { refreshJWT } from "./jwt/refresh/route.js";
import { deleteUserSchema, refreshJWTSchema } from "./jwt/refresh/schema.js";
import { deleteUser } from "./userSession/deleteUser.js";
import { logoutUser, logoutUserSchema } from "./userSession/logout.js";

export async function setAuthRoutes(server: FastifyInstance) {
	server.get('/auth/redirect', async function handler(request, reply) {
		return await authRedirect(server, request, reply);
	});

	server.get('/auth/callback', async function handler(request, reply) {
		return await authCallback(server, request, reply);
	});

	server.post('/auth/token/refresh', { schema: refreshJWTSchema}, async function handler(request, reply) {
		return await refreshJWT(server, request, reply);
	});

	server.delete('/auth/@me/delete', { schema: deleteUserSchema}, async function handler(request, reply) {
		return await deleteUser(request, reply);
	});

	server.post('/auth/@me/logout', { schema: logoutUserSchema}, async function handler(request, reply) {
		return await logoutUser(request, reply);
	});
}

