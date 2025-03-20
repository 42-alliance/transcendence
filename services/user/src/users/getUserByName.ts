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


export async function getUserByName(request: FastifyRequest<{ Params: { name: string } }>, reply: FastifyReply) {
	const { name } = request.params;
  
	try {
		const user = await prisma.users.findUnique({
			where: { name: name },
			select: {
				id: true,
				name: true,
				picture: true,
				banner: true,
				bio: true,
				created_at: true,
			}
		});
  
		if (!user) {
			return reply.status(404).send({ error: "User not found" });
		}
  
	  	return user;
	} catch (error) {
		console.error("Error when trying to search user: ", error);
		return reply.status(500).send({ error: "Internal server error" });
	}
}