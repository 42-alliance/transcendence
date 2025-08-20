import { Type } from "@sinclair/typebox";
import { prisma } from "../index.js";
import { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import { extractUserId, getStatus } from "../utils.js";
import { config } from "../config.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library.js";

export const get_password_hashSchema: FastifySchema = {
	params: Type.Object({
		email: Type.String(), //TODO: peut-etre mettre un pattern
	}),
};

export async function get_password_hash(
	request: FastifyRequest<{ Params: { email: string } }>,
	reply: FastifyReply
) {
	const { email } = request.params;

	console.log("get_password_hash called with email:", email);

	try {
		const hashed_pwd = await prisma.users.findFirstOrThrow({
			where: {
				email: email,
			},
			select: {
				password: true,
				id: true,
				twoFactorEnabled: true,
			},
		});

		return reply.send({
			hash: hashed_pwd.password,
			user_id: hashed_pwd.id,
			twoFactorEnabled: hashed_pwd.twoFactorEnabled,
		});
	} catch (error) {
		console.error("Error:", error);
		if (error.code == "P2025") {
			return reply.status(404).send({ error: "email not found" });
		}
		return reply.status(500).send({ error: "Internal server error" });
	}
}
