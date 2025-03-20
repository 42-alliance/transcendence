import { Type } from "@sinclair/typebox";
import { prisma } from "../index.js";
import fastify, { FastifyReply, FastifyRequest, FastifySchema } from "fastify";


interface userBody {
    name: string;
    email: string;
    picture: string;
}

export const addUserDatabaseSchema: FastifySchema = {
	body: Type.Object({
		name: Type.String({maxLength: 100, pattern: "^[a-zA-Z0-9_]+$"}),
		email: Type.String(),
		picture: Type.String(),
	}),
};

/**
 * Route POST `/users` - Ajoute un nouvel utilisateur à la base de données.
 *
 * @param {import("fastify").FastifyRequest} request - Requête HTTP avec les données de l'utilisateur.
 * @param {import("fastify").FastifyReply} reply - Réponse HTTP.
 * @returns {Promise<object>} L'utilisateur ajouté.
 */
export async function addUserDatabase(request: FastifyRequest, reply: FastifyReply): Promise<object> {
    const body: userBody = request.body as userBody;

    try {
		const user = await prisma.users.findUnique({
			where: {
			  email: body.email 
			}
		});

		if (user) {
			return reply.status(200).send({ id: user.id });
		}
		
		const result = await prisma.users.create({
			data: {
				name: body.name,
				email: body.email,
				picture: body.picture,
			}
		});
		
		return reply.status(201).send({ id: result.id });
    } catch (error: any) {
        console.error("Erreur lors de l'insertion de l'utilisateur :", error);

        if (error.code === "SQLITE_CONSTRAINT") {
            return reply.status(400).send({ error: `Une erreur s'est produite: ${error}` });
        }

        return reply.status(500).send({ error: "Erreur serveur." });
    }
}
