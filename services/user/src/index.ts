import fastify from 'fastify';
import { setupRoutes } from './router.js';
import { initializeDatabase } from './db/db.js';
import './types.js';  // Important: importer les types

export const server = fastify({
    logger: {
        transport: {
            target: "pino-pretty",
            options: { colorize: true },
        },
    },
});

// Initialiser la base de données
const db = await initializeDatabase();
// Ajouter la base de données au contexte de Fastify
server.decorate('db', db);

await setupRoutes(server);  // Passer server comme argument

const port =  parseInt(process.env.USER_PORT!);

server.listen({ port: port, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        console.error(err);
		process.exit(1);
	}
    console.log(`Server listening at ${address}`);
});