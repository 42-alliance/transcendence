import { Type } from "@sinclair/typebox";
import { prisma } from "../index.js";
import { FastifyReply, FastifySchema } from "fastify";

export const getAllUsersSchema: FastifySchema = {
	headers: Type.Object({
		"x-user-id": Type.String({ pattern: "^[0-9]+$" }),
	})
};

/**
 * Route GET `/users` - Récupère tous les utilisateurs de la base de données.
*
 * @param {import("fastify").FastifyReply} reply - Réponse HTTP.
* @returns {Promise<object[]>} Liste des utilisateurs.
*/
export async function getAllUsers(reply: FastifyReply): Promise<object[]> {
	try {
		const users = await prisma.users.findMany({
			select: {
				id: true,
				name: true,
				picture: true,
				banner: true,
				bio: true,
				created_at: true,
			}
		});

		return users;
	} catch (error) {
		console.error("Erreur lors de la recuperation des utilisateurs :", error);
		return reply.status(500).send({ error: "Erreur serveur" });
	}
}