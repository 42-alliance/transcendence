import { FastifyInstance } from 'fastify';
import fastify from 'fastify';

import { setupMatchmaking } from './matchmaking/Matchmaking.js';
import { GameLoop } from './gameplay/gameplay.js';
import { connect } from 'http2';
/**
 * Configure les routes pour les utilisateurs.
 *
 * @param {FastifyInstance} server - Instance du serveur Fastify.
 */


export async function setupModeRoute(server: FastifyInstance) {
    console.log("Setting upp game routes");
    
    server.get('/ws/game/matchmaking', async function handler(request, reply) {
        let token = request.headers['authorization'];
        console.log(token);
        console.log("----------------------------------");
        if (!token) {
            reply.code(401).send({error: 'Unauthorized'});
            return;
        }
        try {
            const response = await fetch('http://localhost:8000/auth/verify', {
                method: 'GET',
                headers: { 'Authorization': token }
            });
    
            if (response.status !== 200) {
                reply.code(401).send({error: 'Unauthorized'});
                console.log("Autentification failed\n\r")
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