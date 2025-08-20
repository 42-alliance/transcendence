import { Type } from "@sinclair/typebox";
import { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import { prisma } from "../index.js";

export const IsNameDispoSchema: FastifySchema = {
	body: Type.Object({
		name: Type.String({
			// 3–20 caractères, lettres/chiffres/underscore uniquement
			pattern: "^[A-Za-z0-9_]+$",
			minLength: 3,
			maxLength: 20,
		}),
	}),
};

interface RequestBody {
	name: string;
}

export async function IsNameDispo(
	request: FastifyRequest,
	reply: FastifyReply
) {
	try {
		const body = request.body as RequestBody;

		const user = await prisma.users.findUnique({
			where: {
				lower_name: body.name.toLowerCase(),
			},
		});

		if (user) {
			return reply.status(200).send({ dispo: false });
		}

		return reply.status(200).send({ dispo: true });
	} catch (error) {
		console.error("Error: ", error);
		return reply
			.status(500)
			.send({ error: "Internal server error " + error });
	}
}
