import Fastify from "fastify";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import { config } from './config.js';
import { setupMediaRoutes } from "./router.js";
import path from "path";

export const server = Fastify({
    logger: {
        transport: {
            target: "pino-pretty",
            options: { colorize: true },
        }
    }
});

await server.register(multipart, {
	limits: {
	  fileSize: 10 * 1024 * 1024 // limite à 10Mo par exemple
	}
});

export const publicPath = path.resolve(`./${config.media.upload_folder}`);

server.register(fastifyStatic, {
	root: publicPath,
	decorateReply: false // Évite de décorer les réponses si vous utilisez plusieurs instances
});

await setupMediaRoutes(server);

server.listen({ port: config.media.port, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        console.error(err);
		process.exit(1);
	}
    console.log(`Server listening at ${address}`);
});