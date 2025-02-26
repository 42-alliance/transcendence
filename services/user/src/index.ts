import fastify from 'fastify';
import { setupRoutes } from './router.js';
import { PrismaClient } from '@prisma/client';
import { setupGrpcServer } from './gRPC/grpc.server.js';

export const prisma = new PrismaClient(); // client prisma


export const server = fastify({
    logger: {
        transport: {
            target: "pino-pretty",
            options: { colorize: true },
        },
    },
});

await setupRoutes(server);

setupGrpcServer();

const port =  parseInt(process.env.USER_PORT!);

server.listen({ port: port, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        console.error(err);
		process.exit(1);
	}
    console.log(`Server listening at ${address}`);
});
