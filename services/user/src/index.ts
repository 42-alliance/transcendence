import fastify from 'fastify';
import { setupRoutes } from './router.js';
import { PrismaClient } from '@prisma/client';


export const prisma = new PrismaClient(); // client prisma

export const server = fastify({
    logger: {
        transport: {
            target: "pino-pretty",
            options: { colorize: true },
        },
    },
});

await setupRoutes(server);  // Passer server comme argument

const port =  parseInt(process.env.USER_PORT!);

server.listen({ port: port, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        console.error(err);
		process.exit(1);
	}
    console.log(`Server listening at ${address}`);
});

import grpc, { Server, ServerCredentials } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import { createUser } from './gRPC/createUser.js';
import { ReflectionService } from '@grpc/reflection';

// Charger le fichier `.proto`
const PROTO_PATH = "src/gRPC/user.proto";
const packageDefinition = loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

// Charger le package gRPC
const grpcObject = grpc.loadPackageDefinition(packageDefinition);
const userProto = grpcObject.user as any; // Forcer le typage si nécessaire

// Initialiser le serveur gRPC
const grpcServer = new Server();
grpcServer.addService(userProto.UserService.service, { CreateUser: createUser });

const reflection = new ReflectionService(packageDefinition);
reflection.addToServer(grpcServer);
// Ajouter le service de réflexion

const GRPC_PORT = process.env.GRPC_PORT || '50051';

grpcServer.bindAsync(`0.0.0.0:${GRPC_PORT}`, ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error("❌ Erreur lors du démarrage du serveur gRPC :", err);
        return;
    }
    console.log(`🚀 gRPC Server listening on port ${port}`);
});
