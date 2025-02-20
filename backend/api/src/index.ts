import fastify from 'fastify';
import { setUpRoutes } from './router.js';
import { initializeDatabase } from './db.js';
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

await setUpRoutes(server);  // Passer server comme argument

server.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});

["SIGINT", "SIGTERM"].forEach(signal => {
    process.on(signal, async () => {
        await server.close();
        process.exit(0);
    });
});