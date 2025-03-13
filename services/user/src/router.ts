import { FastifyInstance } from "fastify";
import { addFriend, getFriends, removeFriend } from "./friends/route.js";
import { getFriendStatus, updateFriendStatus } from "./friends/status/route.js";
import { getPendingFriendRequest } from "./friends/pending/route.js";
import { addFriendSchema, getFriendStatusSchema, getFriendsSchema, getPendingFriendRequestSchema, pendingRequestsSchema, removeFriendSchema, updateFriendStatusSchema } from "./friends/schemas.js";
import { deleteUserDatabase, getAllUsers, addUserDatabase, getUserByName } from "./users/route.js";
import { addUserDatabaseSchema, nameParamsSchema, updatedUserInfosSchema, userIdHeader } from "./users/schema.js";
import { me } from "./users/@me/route.js";
import { updateUserInfos } from "./users/@me/updateUserInfos.js";

/**
 * Configure les routes pour les utilisateurs.
 *
 * @param {FastifyInstance} server - Instance du serveur Fastify.
 */
async function setupUsersRoute(server: FastifyInstance) {
	server.get('/users', { schema: userIdHeader}, async function handler(request, reply) {
		return await getAllUsers(server, reply);
	});


	server.get<{Params: { name: string }}>('/users/:name', { schema: nameParamsSchema }, async function handler(request, reply) {
		return await getUserByName(server, request, reply);
	});

	server.delete("/users", { schema: userIdHeader }, async function handler(request, reply) {
		return await deleteUserDatabase(server, request, reply);
	});

	server.post("/users", { schema: addUserDatabaseSchema }, async function handler(request, reply) {
		return await addUserDatabase(server, request, reply);
	});

	server.get('/users/@me', { schema: userIdHeader }, async function handler(request, reply) {
		return await me(server, request, reply);
	});

	server.patch('/users/@me', async function handler(request, reply) {
		return await updateUserInfos(request, reply);
	});
}


/**
 * Configure les routes pour la gestion d'amis.
 *
 * @param {FastifyInstance} server - Instance du serveur Fastify.
 */
async function setupFriendsRoute(server: FastifyInstance) {
	// Envoyer une demande d'ami
	server.post('/friends/requests', { schema: addFriendSchema }, async function handler(request, reply) {
	  return await addFriend(server, request, reply);
	});
  
	// Supprimer une relation d'amitié ou une demande d'ami
	server.delete<{ Params: { friendId: string } }>('/friends/:friendId', { schema: removeFriendSchema }, async function handler(request, reply) {
	  return await removeFriend(server, request, reply);
	});
  
	// Obtenir la liste des amis
	server.get('/friends/list', { schema: getFriendsSchema}, async function handler(request, reply) {
	  return await getFriends(server, request, reply);
	});
  
	// Mettre à jour le statut d'une demande d'ami
	server.post<{ Params: { friendId: string } }>('/friends/requests/:friendId/status', { schema: updateFriendStatusSchema }, async function handler(request, reply) {
	  return await updateFriendStatus(server, request, reply);
	});
  
	server.get<{ Params: { friendId: string } }>('/friends/status/:friendId', { schema: getFriendStatusSchema }, async function handler(request, reply) {
		return await getFriendStatus(server, request, reply);
	});
	
	// Obtenir les demandes d'amis en attente
	server.get('/friends/requests/pending', { schema: getPendingFriendRequestSchema}, async function handler(request, reply) {
	  return await getPendingFriendRequest(server, request, reply);
	});
}

export async function setupRoutes(server: FastifyInstance) {
	await setupUsersRoute(server);
	await setupFriendsRoute(server);
}