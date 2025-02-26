import { FastifyInstance } from "fastify";
import { addFriend, getFriends, removeFriend } from "./friends/route.js";
import { getFriendStatus, updateFriendStatus } from "./friends/status/route.js";
import { getPendingFriendRequest } from "./friends/pending/route.js";
import { addFriendSchema, areFriendsSchema, pendingRequestsSchema } from "./friends/schemas.js";
import { deleteUserDatabase, getAllUsers, addUserDatabase } from "./users/route.js";
import { addUserDatabaseSchema, deleteUserDatabaseSchema } from "./users/schema.js";
import { me } from "./users/@me/route.js";

/**
 * Configure les routes pour les utilisateurs.
 *
 * @param {FastifyInstance} server - Instance du serveur Fastify.
 */
async function setupUsersRoute(server: FastifyInstance) {
	server.get('/users', async function handler(request, reply) {
		return await getAllUsers(server, reply);
	});

	server.delete("/users", { schema: deleteUserDatabaseSchema }, async function handler(request, reply) {
		return await deleteUserDatabase(server, request, reply);
	});

	server.post("/users", { schema: addUserDatabaseSchema }, async function handler(request, reply) {
		return await addUserDatabase(server, request, reply);
	});

	server.get('/users/@me', async function handler(request, reply) {
		return await me(server, request, reply);
	});
}


/**
 * Configure les routes pour la gestion d'amis.
 *
 * @param {FastifyInstance} server - Instance du serveur Fastify.
 */
async function setupFriendsRoute(server: FastifyInstance) {
	// /friends
	server.post('/friends', { schema:addFriendSchema }, async function handler(request, reply) {
		return await addFriend(server, request, reply);
	});
	
	server.delete<{Params: { friendId: string }}>('/friends/:friendId', async function handler(request, reply) {
		return await removeFriend(server, request, reply);
	});
	
	server.get('/friends', async function handler(request, reply) {
		return await getFriends(server, request, reply);
	});

	// /friends/status
	server.post<{Params: { friendId: string }}>('/friends/:friendId/status', async function handler(request, reply) {
		return await updateFriendStatus(server, request, reply);
	});

	server.get('/friends/status', {schema: areFriendsSchema}, async function handler(request, reply) {
		return await getFriendStatus(server, request, reply);
	});

	// /friends/pending
	server.get('/friends/pending', async function handler(request, reply) {
		return await getPendingFriendRequest(server, request, reply);
	});
}

export async function setupRoutes(server: FastifyInstance) {
	await setupUsersRoute(server);
	await setupFriendsRoute(server);
}