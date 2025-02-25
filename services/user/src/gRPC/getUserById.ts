import { prisma } from "../index.js";
import * as grpc from "@grpc/grpc-js";

export const getUserById = async (call: any, callback: any) => {
	try {
		const { id } = call.request;

		const existingUser = await prisma.users.findUnique({ where: { id } });

		if (!existingUser) {
			console.error("[getUserById gRPC] - User not found");
			return callback({ code: grpc.status.NOT_FOUND, message: "User not found" });
		}

		return callback(null, {
			id: existingUser.id,
			name: existingUser.name,
			picture: existingUser.picture,
		});
	} catch (error) {
		console.error("[getUserById gRPC] - getUserById:", error);
		callback({ code: grpc.status.INTERNAL, message: "Error serveur" });
	}
};
