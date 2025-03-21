import { FastifyInstance } from "fastify";
import { getFriendStatus, getFriendStatusSchema } from "./friends/status/getFriendStatus.js";
import { updateUserInfos } from "./users/@me/updateUserInfos.js";
import { deleteUserDatabase, deleteUserDatabaseSchema } from "./users/delete.user.js";
import { addFriend, addFriendSchema } from "./friends/addFriend.js";
import { removeFriend, removeFriendSchema } from "./friends/removeFriend.js";
import { getFriends, getFriendsSchema } from "./friends/getFriends.js";
import { updateFriendStatus, updateFriendStatusSchema } from "./friends/status/updateFriendsStatus.js";
import { getPendingFriendRequest, getPendingFriendRequestSchema } from "./friends/pending/getPendingRequest.js";
import { getAllUsers, getAllUsersSchema } from "./users/getAllUsers.js";
import { getUserByName, getUserByNameSchema } from "./users/getUserByName.js";
import { addUserDatabase, addUserDatabaseSchema } from "./users/addUser.js";
import { me, meSchema } from "./users/@me/@me.js";
import { getSendFriendRequest, getSendFriendRequestSchema } from "./friends/pending/getSendFriendRequest.js";

/**
 * Configure les routes pour les utilisateurs.
 *
 * @param {FastifyInstance} server - Instance du serveur Fastify.
 */
async function setupUsersRoute(server: FastifyInstance) {
	server.get('/users', { schema: getAllUsersSchema}, async function handler(request, reply) {
		return await getAllUsers(reply);
	});


	server.get<{Params: { name: string }}>('/users/:name', { schema: getUserByNameSchema }, async function handler(request, reply) {
		return await getUserByName(request, reply);
	});

	server.delete("/users", { schema: deleteUserDatabaseSchema }, async function handler(request, reply) {
		return await deleteUserDatabase(request, reply);
	});

	server.post("/users", { schema: addUserDatabaseSchema }, async function handler(request, reply) {
		return await addUserDatabase(request, reply);
	});

	server.get('/users/@me', { schema: meSchema }, async function handler(request, reply) {
		return await me(request, reply);
	});

	server.put('/users/@me', async function handler(request, reply) {
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
	  return await addFriend(request, reply);
	});
  
	// Supprimer une relation d'amitié ou une demande d'ami
	server.delete<{ Params: { friendId: string } }>('/friends/:friendId', { schema: removeFriendSchema }, async function handler(request, reply) {
	  return await removeFriend(request, reply);
	});
  
	// Obtenir la liste des amis
	server.get('/friends/list', { schema: getFriendsSchema}, async function handler(request, reply) {
	  return await getFriends(request, reply);
	});
  
	// Mettre à jour le statut d'une demande d'ami
	server.post<{ Params: { friendId: string } }>('/friends/requests/:friendId/status', { schema: updateFriendStatusSchema }, async function handler(request, reply) {
	  return await updateFriendStatus(request, reply);
	});
  
	server.get<{ Params: { friendId: string } }>('/friends/status/:friendId', { schema: getFriendStatusSchema }, async function handler(request, reply) {
		return await getFriendStatus(request, reply);
	});
	
	// Obtenir les demandes d'amis en attente
	server.get('/friends/requests/pending', { schema: getPendingFriendRequestSchema}, async function handler(request, reply) {
	  return await getPendingFriendRequest(request, reply);
	});
	
	// Obtenir les demandes d'amis envoye
	server.get('/friends/requests/send', { schema: getSendFriendRequestSchema}, async function handler(request, reply) {
	  return await getSendFriendRequest(request, reply);
	});
}

export async function setupRoutes(server: FastifyInstance) {
	await setupUsersRoute(server);
	await setupFriendsRoute(server);
}