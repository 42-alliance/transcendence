import { FastifyInstance } from 'fastify';
import { ConnectWSonline } from './route.js';
import { ConnectWSlocal } from './route.js';
import fastify from 'fastify';
import { setupMatchmaking } from './matchmaking/Matchmaking.js';
import { GameLoop } from './gameplay/gameplay.js';
import { connect } from 'http2';
/**
 * Configure les routes pour les utilisateurs.
 *
 * @param {FastifyInstance} server - Instance du serveur Fastify.
 */

export async function setupModeRoute(serverGame: FastifyInstance) {
    console.log("Setting up game routes");
    serverGame.get('/ws/game/matchmaking', async function handler(request, reply) {
        let token = request.headers['authorization'];
        if (!token) {
            reply.code(401).send({error: 'Unauthorized'});
            return;
        }
    
        try {
            const response = await fetch('http://localhost:3000/auth/verify', {
                method: 'GET',
                headers: { 'Authorization': token }
            });
    
            if (response.status !== 200) {
                reply.code(401).send({error: 'Unauthorized'});
                return;
            }
    
            const userData = await response.json();
            reply.send({ success: true, token: token }); // On envoie juste le token
        } catch (error) {
            reply.code(500).send({error: 'Internal Server Error'});
        }
    });    
}


export async function setUpRoutesGame(serverGame: FastifyInstance) {
    await setupModeRoute(serverGame);
    await GameLoop();
}