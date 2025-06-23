import { Type } from "@sinclair/typebox";
import { prisma } from "../index.js";
import { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import { extractUserId } from "../utils.js";

export const getUserByNameSchema: FastifySchema = {
	headers: Type.Object({
		"x-user-id": Type.String({ pattern: "^[0-9]+$" }),
	}),
	params: Type.Object({
		name: Type.String({maxLength: 100, pattern: "^[a-zA-Z0-9_]+$"}),
	})
};

export async function getUserBlockedList(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const { id } = request.params as { id: string };

    const userID = parseInt(id);

    if (isNaN(userID)) {
        return reply.code(400).send({message: "ID utilisateur introuvable"});
    }

	const user = await prisma.users.findUnique({
		where: { id: userID },
		select: {
			blockedUsers: {
				select: {
					blocked: {
						select: {
							id: true,
							name: true,
							email: true,
							picture: true,
							bio: true,
						},
					},
				},
			},
		},
	});

	if (!user) {
		return reply.code(404).send({ message: "Utilisateur introuvable" });
	}

	// Extraire les utilisateurs bloqués depuis la relation pivot
	const blockedList = user.blockedUsers.map((entry) => entry.blocked);

	return reply.send({ blockedList });
}
