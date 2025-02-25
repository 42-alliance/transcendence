import Fastify from 'fastify';
import { setAuthRoutes } from './router.js';
import { config } from './config.js';
import { setupPlugins } from './plugins/setupPlugins.js';

export const server = Fastify({
    logger: {
        transport: {
            target: "pino-pretty",
            options: { colorize: true },
        },
    },
});

setupPlugins(server);

await setAuthRoutes(server);

server.listen({ port: config.auth.port, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        console.error(err);
		process.exit(1);
	}
    console.log(`Server listening at ${address}`);
});
