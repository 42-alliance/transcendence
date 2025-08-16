import { Type } from "@sinclair/typebox";
import { prisma } from "../index.js";
import { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import { extractUserId, getStatus } from "../utils.js";
import { config } from "../config.js";

export const get_password_hashSchema: FastifySchema = {
	headers: Type.Object({
		"x-user-id": Type.String({ pattern: "^[0-9]+$" }),
	}),
	params: Type.Object({
		email: Type.String(), //TODO: peut-etre mettre un pattern
	})
};

export async function get_password_hash(
	request: FastifyRequest<{ Params: { email: string } }>,
	reply: FastifyReply
) {
	const { email } = request.params;

	console.log("get_password_hash called with email:", email);

	try {
		const hashed_pwd = await prisma.users.findFirst({
			where: {
				email: email,
			},
			select: {
				password: true,
			}
		});

		return reply.send({ hash: hashed_pwd.password });
	} catch (error) {
		console.error("Error:", error);
		return reply.status(400).send({ error: "Internal server error" });
	}
}
