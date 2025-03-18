import { FastifyInstance } from 'fastify';
import { ConnectWSonline } from './route.js';
import { ConnectWSlocal } from './route.js';
import fastify from 'fastify';
import { setupMatchmaking } from './matchmaking/Matchmaking.js';
import { GameLoop } from './gameplay/gameplay.js';
/**
 * Configure les routes pour les utilisateurs.
 *
 * @param {FastifyInstance} server - Instance du serveur Fastify.
 */

let i = 0;
export async function setupModeRoute(serverGame: FastifyInstance) {
    console.log("Setting up game routes");
	serverGame.get('/ws/online', async function handler(request, reply) {
        //Grpc call
        
        const data = {
            username: "test" + i
        };
        i++;
		return await ConnectWSonline(data.username);
	});
    
    serverGame.get('/ws/local', async function handler(request, reply) {
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


export async function setUpRoutesGame(serverGame: FastifyInstance) {
    await setupModeRoute(serverGame);
    await setupMatchmaking();
    await GameLoop();
}