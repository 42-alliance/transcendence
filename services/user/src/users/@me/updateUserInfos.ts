import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../index.js";
import { extractUserId } from "../../utils";


export async function updateUserInfos(request:FastifyRequest, reply: FastifyReply) {

	const userId = extractUserId(request);
	const { name } = request.body as {
		name?: string,
	};


	if (name) {
		await prisma.users.update({
			where: {
				id: userId,
			},
			data: {
				name: name,
			}
		});
	}

	
}