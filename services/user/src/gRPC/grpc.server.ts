import { Server, ServerCredentials } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import { createUser } from './createUser.js';

// Charger le fichier `.proto`
const PROTO_PATH = "src/gRPC/user.proto";
const packageDefinition = loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const grpcObject = require('@grpc/grpc-js').loadPackageDefinition(packageDefinition);
const userProto = grpcObject.user;

// Initialiser le serveur gRPC
const grpcServer = new Server();
grpcServer.addService(userProto.UserService.service, { CreateUser: createUser });

const GRPC_PORT = process.env.GRPC_PORT || '50051';
grpcServer.bindAsync(`0.0.0.0:${GRPC_PORT}`, ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error("❌ Erreur lors du démarrage du serveur gRPC :", err);
        return;
    }
    console.log(`🚀 gRPC Server listening on port ${port}`);
});