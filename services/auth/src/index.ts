import Fastify from 'fastify';
import jwt from "@fastify/jwt";
import { setAuthRoutes } from './router.js';
import cookie from "@fastify/cookie";
import { config } from './config.js';
import fs from 'fs';
import path from 'path';

export const server = Fastify({
    logger: {
        transport: {
            target: "pino-pretty",
            options: { colorize: true },
        },
    },
	https: {
		key: fs.readFileSync(path.resolve("./ssl/selfsigned.key")),
		cert: fs.readFileSync(path.resolve("./ssl/selfsigned.crt")),
	},
});

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
