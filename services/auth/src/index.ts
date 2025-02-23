import Fastify from 'fastify';
import jwt from "@fastify/jwt";
import { setAuthRoutes } from './router.js';
import { initializeDatabase } from './db/db.js';
import './types.js';  // Important: importer les types
import cookie from "@fastify/cookie";

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
	secret: "my-secret-key", // Clé pour signer les cookies (facultatif)
	parseOptions: {}, // Options de parsing
  });

server.register(jwt, {
	secret: process.env.JWT_SECRET || "CHEF_REGARDE_ENV"
});

await setAuthRoutes(server);  // Passer server comme argument

const port = parseInt(process.env.AUTH_PORT!);

server.listen({ port: port, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        console.error(err);
		process.exit(1);
	}
    console.log(`Server listening at ${address}`);
});