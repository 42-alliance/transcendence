import { Type } from "@sinclair/typebox";
import { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import { prisma } from "../../index.js";

export const IsEmailDispoSchema: FastifySchema = {
	body: Type.Object({
		email: Type.String({
			pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
			minLength: 5,
			maxLength: 254,
		}),
	}),
};


interface RequestBody {
	email: string;
}

export async function IsEmailDispo(
	request: FastifyRequest,
	reply: FastifyReply
) {
	try {
		const body = request.body as RequestBody;

		const user = await prisma.users.findUnique({
			where: {
				email: body.email,
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
