import { addFriend, areFriends, getFriends, getPendingFriendRequest, removeFriend, updateFriendStatus } from "./friends/route.js";
import { areFriendsSchema, pendingRequestsSchema } from "./friends/schemas.js";
import { deleteUserDatabase, getAllUsers } from "./users/route.js";
/**
 * Configure les routes pour les utilisateurs.
 *
 * @param {FastifyInstance} server - Instance du serveur Fastify.
 */
async function setupUsersRoute(server) {
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
async function setupFriendsRoute(server) {
    server.post('/friends', async function handler(request, reply) {
        return await addFriend(server, request, reply);
    });
    server.post('/friends/:friendId/status', async function handler(request, reply) {
        return await updateFriendStatus(server, request, reply);
    });
    server.delete('/friends/:friendId', async function handler(request, reply) {
        return await removeFriend(server, request, reply);
    });
    server.get('/friends/relationship', { schema: areFriendsSchema }, async function handler(request, reply) {
        return await areFriends(server, request, reply);
    });
    server.get('/friends', async function handler(request, reply) {
        return await getFriends(server, request, reply);
    });
    server.get('/friends/pending/:userId', { schema: pendingRequestsSchema }, async function handler(request, reply) {
        return await getPendingFriendRequest(server, request, reply);
    });
}
export async function setupRoutes(server) {
    await setupUsersRoute(server);
    await setupFriendsRoute(server);
}
//# sourceMappingURL=router.js.map