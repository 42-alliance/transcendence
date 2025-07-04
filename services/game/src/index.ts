import fastify from 'fastify';
import cors from '@fastify/cors'
import { setUpRoutesGame } from './router.js';
import fs from 'fs';
import path from 'path';

export const server = fastify({
    logger: {
        transport: {
            target: "pino-pretty",
            options: { colorize: true },
        },
    },
	https: {
		key: fs.readFileSync(path.resolve("./ssl/selfsigned.key")),
		cert: fs.readFileSync(path.resolve("./ssl/selfsigned.crt")),
	}
});


await server.register(cors, {
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080'], // Autoriser les requêtes CORS depuis ces origines
    methods: ["GET"], // Méthodes HTTP autorisées
});


await setUpRoutesGame(server);  // Passer server comme argument


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
