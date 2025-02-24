import { credentials, loadPackageDefinition, ServiceClientConstructor } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';

// Charger le fichier proto
const PROTO_PATH = "src/gRPC/user.proto";
const packageDefinition = loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Charger le package gRPC
const grpcObject = loadPackageDefinition(packageDefinition);

// Vérifier si `UserService` existe bien
if (!grpcObject.user || !(grpcObject.user as any).UserService) {
  throw new Error("❌ Erreur : `UserService` introuvable dans user.proto !");
}

// Récupérer le service UserService
const UserService = (grpcObject.user as any).UserService as ServiceClientConstructor;

// Créer un client gRPC pour UserService
export const userClient = new UserService(
  'user:50051', // Adresse du user-service gRPC
  credentials.createInsecure()
);

// Fonction pour appeler gRPC et créer un utilisateur
export const createUser = (picture: string, name: string): Promise<{ id: string }> => {
	return new Promise((resolve, reject) => {
		userClient.CreateUser({ picture, name }, (error: Error | null, response: { id: string }) => {
			if (error) {
				console.error("❌ Erreur gRPC CreateUser:", error);
				return reject(error);
			}
			console.log("✅ gRPC CreateUser success");
			resolve(response);
		});
	});
};

