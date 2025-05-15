import { FastifyInstance, FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import { prisma } from "../index.js";
import { extractUserId } from "../utils.js"
import { Type } from '@sinclair/typebox'

export const addFriendSchema: FastifySchema = {
	headers: Type.Object({
		"x-user-id": Type.String({ pattern: "^[0-9]+$" }),
	}),
	body: Type.Object({
		friendName: Type.String(),
	}),
};

export async function addFriend(request: FastifyRequest, reply: FastifyReply) {
	const userId = extractUserId(request);

	const { friendName } = request.body as { friendName: string };
	
	try {
		const friend = await prisma.users.findUnique({
			where: {
				name: friendName,
			}
		});

		if (!friend) {
			console.error("This friend don't exist");
			return reply.status(404).send({ message: "This friend don't exist" });
		}
		
		if (userId === friend.id) {
			console.error("You cannot add yourself as a friend");
			return reply.status(400).send({ message: "You cannot add yourself as a friend" });
		}

		const existingFriendChip = await prisma.friends.findFirst({
			where: {
				OR: [
					{ senderId: userId, receiverId: friend.id},
					{ senderId: friend.id, receiverId: userId}
				]
			}
		});

		if (existingFriendChip) {
			await prisma.friends.updateMany({
				where: {
					senderId: friend.id,
					receiverId: userId,
				},
				data: {
					status: "accepted",
				}
			});
			return reply.status(201).send({message: `Friend request is now accepted`});
		}

		await prisma.friends.create({
			data: {
				senderId: userId,
				receiverId: friend.id,
			}
		});
		console.log(`Demande d'ami envoyée de ${userId} à ${friendName}.`);

		return reply.status(201).send({ message: `Friend request sent to ${friend.name}` });
	} catch (error) {
		console.error("Error server:" + error);
		return reply.status(500).send({ message: "Erreur serveur." });
	}
}
