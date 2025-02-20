import { FastifyInstance } from 'fastify';
import { oui } from "./oui/route.js";

export async function setUpRoutes(server: FastifyInstance) {
    server.get('/oui', async function handler(request, reply) {
        console.log('oui');
        return oui();
    });

    server.get('/ping', async (request, reply) => {
        return 'pong\n';
    });

    server.post('/items', async function handler(request, reply) {
        const { name } = request.body as { name: string };
        const result = await server.db.run(
            'INSERT INTO items (name) VALUES (?)',
            [name]
        );
        return { id: result.lastID };
    });

    server.get('/items', async function handler(request, reply) {
        const items = await server.db.all('SELECT * FROM items');
        return items;
    });
}