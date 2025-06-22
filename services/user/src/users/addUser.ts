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

export function generateRandomString(length: number) {
	let result = "";
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

async function tryNameDatabase(name: string): Promise<string> {
	let nb = 0;
	let test_name = name + "_";

	while (true) {
		if (!await prisma.users.findFirst({
			where: {
				name: test_name + nb
			}
		}))
			return test_name + nb;
		nb++;
	}
}

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
		
		if (await prisma.users.findFirst({
			where: {
				name: body.name,
			}
		})) {
			body.name = await tryNameDatabase(body.name);
		}

		console.log("DEBUG BODY NAME = ", body.name);
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
