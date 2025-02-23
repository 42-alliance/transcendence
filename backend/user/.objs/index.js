import fastify from 'fastify';
import { setupRoutes } from './router.js';
import { initializeDatabase } from './db/db.js';
import './types.js'; // Important: importer les types
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
await setupRoutes(server); // Passer server comme argument
const port = process.env.USER_PORT || process.exit(1);
if (port === null) {
    console.error("AUTH_PORT env key is not set");
    process.exit(1);
}
server.listen({ port: parseInt(port), host: "0.0.0.0" }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
//# sourceMappingURL=index.js.map