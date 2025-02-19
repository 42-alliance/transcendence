import fastify from 'fastify'
import { setUpRoutes } from './router.js'

export const server = fastify({
	logger: {
		transport: {
			target: "pino-pretty",
			options: { colorize: true },
		},
	},
});

// server.register(setUpRoutes);

// await setUpRoutes();

await setUpRoutes();

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