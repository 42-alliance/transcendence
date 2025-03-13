import fastify from 'fastify';
import { setupRoutes } from './router.js';
import { PrismaClient } from '@prisma/client';
import multipart from "@fastify/multipart";

export const prisma = new PrismaClient(); // client prisma

export const server = fastify({
    logger: {
        transport: {
            target: "pino-pretty",
            options: { colorize: true },
        },
    },
});

await server.register(multipart, {
	limits: {
	  fileSize: 10 * 1024 * 1024 // limite à 10Mo par exemple
	}
});

server.get("/users/healthcheck", async function handler(request, reply) {
	return reply.status(200).send("user server is ready");
});

await setupRoutes(server);

const port =  parseInt(process.env.USER_PORT!);

server.listen({ port: port, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        console.error(err);
		process.exit(1);
	}
    console.log(`Server listening at ${address}`);
});
