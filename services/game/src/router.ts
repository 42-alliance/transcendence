import { FastifyInstance, FastifyRequest } from 'fastify';
import fastify from 'fastify';
import { GameLoop } from './gameplay/gameplay.js';
import { setupMatchmaking } from './matchmaking/Matchmaking.js';
import { connect } from 'http2';
/**
 * Configure les routes pour les utilisateurs.
 *
@param {FastifyInstance} server - Instance du serveur Fastify.
 */

export function extractUserId(request: FastifyRequest) {
    return Number(request.headers["x-user-id"] as string);
}

export function extractUserName(request: FastifyRequest) {
    return request.headers["x-user-name"] as string;
}

export async function setupModeRoute(server: FastifyInstance) {
    console.log("Setting upp game routes");
    server.get('/ws/game/matchmaking', async function handler(request, reply) {
        try {
            const userId = extractUserId(request);
            const userName = extractUserName(request);
            reply.status(200).send({ success: true });
        }
        catch (e) {
            console.error(e);
            reply.status(500).send({ success: false });
        }
    });
}; 



export async function setUpRoutesGame(serverGame: FastifyInstance) {
    await setupModeRoute(serverGame);
    await setupMatchmaking();
    await GameLoop();
}