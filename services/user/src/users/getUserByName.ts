import { Type } from "@sinclair/typebox";
import { prisma } from "../index.js";
import { FastifyReply, FastifyRequest, FastifySchema } from "fastify";

export const getUserByNameSchema: FastifySchema = {
	headers: Type.Object({
		"x-user-id": Type.String({ pattern: "^[0-9]+$" }),
	}),
	params: Type.Object({
		name: Type.String({maxLength: 100, pattern: "^[a-zA-Z0-9_]+$"}),
	})
};

export async function getUserByName(
	request: FastifyRequest<{ Params: { name: string } }>,
	reply: FastifyReply
) {
	const { name } = request.params;

	try {
		// Utilisation de $queryRawUnsafe pour insérer dynamiquement la valeur de name
		const users = await prisma.$queryRawUnsafe<
			{
				id: number;
				name: string;
				picture: string;
				banner: string | null;
				bio: string | null;
				created_at: Date;
			}[]
		>(`
			SELECT id, name, picture, banner, bio, created_at
			FROM Users
			WHERE LOWER(name) = LOWER(${JSON.stringify(name)})
			LIMIT 1;
		`);

		const user = users[0];

		if (!user) {
			console.error("User not found");
			return reply.status(404).send({ error: "User not found" });
		}

		return user;
	} catch (error) {
		console.error("Unexpected error:", error);
		return reply.status(500).send({ error: "Internal server error" });
	}
}
