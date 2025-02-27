import { ConnectWSonline } from './route.js';
import { ConnectWSlocal } from './route.js';
/**
 * Configure les routes pour les utilisateurs.
 *
 * @param {FastifyInstance} server - Instance du serveur Fastify.
 */
export async function setupModeRoute(serverGame) {
    console.log("Setting up game routes");
    serverGame.get('/ws/online', async function handler(request, reply) {
        console.log("catched requqeust************************");
        let token = request.headers['Authorization'];
        if (!token) {
            reply.code(401).send({ error: 'Unauthorized' });
            return;
        }
        const response = await fetch('http://localhost:3000/auth/verify', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            }
        });
        if (response.status !== 200) {
            reply.code(401).send({ error: 'Unauthorized' });
            return;
        }
        const data = await response.json();
        return await ConnectWSonline(data.username);
    });
    serverGame.get('/ws/local', async function handler(request, reply) {
        let token = request.headers['Authorization'];
        if (!token) {
            reply.code(401).send({ error: 'Unauthorized' });
            return;
        }
        const response = await fetch('http://localhost:3000/auth/verify', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            }
        });
        if (response.status !== 200) {
            reply.code(401).send({ error: 'Unauthorized' });
            return;
        }
        const data = await response.json();
        return await ConnectWSlocal(data.username);
    });
}
export async function setUpRoutesGame(serverGame) {
    await setupModeRoute(serverGame);
}
