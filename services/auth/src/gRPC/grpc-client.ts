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

const grpcObject = loadPackageDefinition(packageDefinition);

if (!grpcObject.user || !(grpcObject.user as any).UserService) {
  throw new Error("❌ Erreur : `UserService` introuvable dans user.proto !");
}

const UserService = (grpcObject.user as any).UserService as ServiceClientConstructor;

export const userClient = new UserService(
  'user:50051',
  credentials.createInsecure()
);

// Fonction pour appeler gRPC et créer un utilisateur
export const createUser = (picture: string, name: string): Promise<{ id: number }> => {
	return new Promise((resolve, reject) => {
		userClient.CreateUser({ picture, name }, (error: Error | null, response: { id: number }) => {
			if (error) {
				console.error("❌ Erreur gRPC CreateUser:", error);
				return reject(error);
			}
			console.log("✅ gRPC CreateUser success");
			resolve(response);
		});
	});
};

// Fonction pour appeler gRPC et créer un utilisateur
export const getUserById = (id: number): Promise<{ id: number, name: string, picture: string }> => {
	return new Promise((resolve, reject) => {
		userClient.GetUserById({ id }, (error: Error | null, response: { id: number, name: string, picture: string }) => {
			if (error) {
				console.error("❌ Erreur gRPC GetUserById:", error);
				return reject(error);
			}
			console.log("✅ gRPC GetUserById success");
			resolve(response);
		});
	});
};
