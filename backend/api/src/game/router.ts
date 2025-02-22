import { FastifyInstance } from 'fastify';
import { ConnectWSonline } from './route.js';
import { ConnectWSlocal } from './route.js';


/**
 * Configure les routes pour les utilisateurs.
 *
 * @param {FastifyInstance} server - Instance du serveur Fastify.
 */

async function setupModeRoute(server: FastifyInstance) {
	server.get('/ws/online', async function handler(request, reply) {
        let token = request.headers['Authorization'];
        if (!token) {
            reply.code(401).send({error: 'Unauthorized'});
            return;
        }
        const response  = await fetch('http://localhost:3000/auth/verify', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : `${token}`
            }
        });
        if (response.status !== 200) {
            reply.code(401).send({error: 'Unauthorized'});
            return;
        }
        const data = await response.json();

		return await ConnectWSonline(data.username);
	});

    server.get('/ws/local', async function handler(request, reply) {
        let token = request.headers['Authorization'];
        if (!token) {
            reply.code(401).send({error: 'Unauthorized'});
            return;
        }
        const response  = await fetch('http://localhost:3000/auth/verify', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : `${token}`
            }
        });
        if (response.status !== 200) {
            reply.code(401).send({error: 'Unauthorized'});
            return;
        }
        const data = await response.json();

		return await ConnectWSlocal(data.username);
	});
}


export async function setUpRoutes(server: FastifyInstance) {
	await setupModeRoute(server);
}