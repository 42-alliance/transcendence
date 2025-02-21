import { FastifyInstance } from 'fastify';
import { oui } from "./oui/route.js";
import { addUserDatabase, deleteUserDatabase, getAllUsers } from './users/route.js';
import { addFriend, areFriends, getFriends, getPendingFriendRequest, removeFriend, updateFriendStatus } from './friends/route.js';
import { areFriendsSchema, pendingRequestsSchema } from './friends/schemas.js';

/**
 * Configure les routes pour les utilisateurs.
 *
 * @param {FastifyInstance} server - Instance du serveur Fastify.
 */
async function setupUsersRoute(server: FastifyInstance) {
	server.post('/users', async function handler(request, reply) {
		return await addUserDatabase(server, request, reply);
		
	});
	
	server.get('/users', async function handler(request, reply) {
		return await getAllUsers(server, reply);
	});

	server.delete("/users", async function handler(request, reply) {
		return await deleteUserDatabase(server, request, reply);
	});
}


/**
 * Configure les routes pour la gestion d'amis.
 *
 * @param {FastifyInstance} server - Instance du serveur Fastify.
 */
async function setupFriendsRoute(server: FastifyInstance) {
	server.post('/friends', async function handler(request, reply) {
		return await addFriend(server, request, reply);
	});


	server.post<{Params: { friendId: string }}>('/friends/:friendId/status', async function handler(request, reply) {
		return await updateFriendStatus(server, request, reply);
	});

	server.delete<{Params: { friendId: string }}>('/friends/:friendId', async function handler(request, reply) {
		return await removeFriend(server, request, reply);
	});

	server.get('/friends/relationship', {schema: areFriendsSchema}, async function handler(request, reply) {
		return await areFriends(server, request, reply);
	});

	server.get('/friends', async function handler(request, reply) {
		return await getFriends(server, request, reply);
	});

	server.get<{Params: { userId: string }}>('/friends/pending/:userId', {schema: pendingRequestsSchema}, async function handler(request, reply) {
		return await getPendingFriendRequest(server, request, reply);
	});
}


export async function setUpRoutes(server: FastifyInstance) {
	await setupUsersRoute(server);

	await setupFriendsRoute(server);

    server.get('/oui', async function handler(request, reply) {
        return oui();
    });

    server.get('/ping', async (request, reply) => {
        return 'pong\n';
    });

}