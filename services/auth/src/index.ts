import Fastify from 'fastify';
import jwt from "@fastify/jwt";
import { setAuthRoutes } from './router.js';
import { initializeDatabase } from './db/db.js';
import './types.js';  // Important: importer les types
import cookie from "@fastify/cookie";
import { config } from './config.js';

export const server = Fastify({
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

server.register(cookie, {
	parseOptions: {}, // Options de parsing
});

server.register(jwt, {
	secret: config.jwt.secret,
});

await setAuthRoutes(server);  // Passer server comme argument

server.listen({ port: config.auth.port, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        console.error(err);
		process.exit(1);
	}
    console.log(`Server listening at ${address}`);
});