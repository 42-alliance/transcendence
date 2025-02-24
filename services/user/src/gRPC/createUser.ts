import { prisma } from '../index.js';

export const createUser = async (call: any, callback: any) => {
	try {
		const { picture, name } = call.request;

		const existingUser = await prisma.users.findUnique({ where: { name } });

		if (existingUser) {
			return callback(null, { id: existingUser.id });
		}

		const newUser = await prisma.users.create({ data: { picture, name } });

		callback(null, { id: newUser.id });
	} catch (error) {
		console.error("Erreur gRPC - CreateUser:", error);
		callback({ code: 13, message: "Erreur serveur" });
	}
};
