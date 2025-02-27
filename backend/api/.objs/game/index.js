import fastify from 'fastify';
import { setUpRoutesGame } from './router.js';
import { initializeDatabase } from '../db.js';
import './types.js'; // Important: importer les types
import jwt from "@fastify/jwt";
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
server.register(jwt, {
    secret: process.env.JWT_SECRET_TOKEN || "CHEF_REGARDE_ENV"
});
await setUpRoutesGame(server); // Passer server comme argument
server.listen({ port: 8765, host: "0.0.0.0" }, (err, address) => {
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
