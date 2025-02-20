import { FastifyInstance } from 'fastify';
import { oui } from "./oui/route.js";
import { addUserDatabase, getAllUsers } from './users/route.js';

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
		return await getAllUsers(server);
	});
}


export async function setUpRoutes(server: FastifyInstance) {
	await setupUsersRoute(server);


    server.get('/oui', async function handler(request, reply) {
        return oui();
    });

    server.get('/ping', async (request, reply) => {
        return 'pong\n';
    });

}