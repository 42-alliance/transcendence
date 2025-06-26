import { FastifyInstance, FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import { connectedSockets, prisma } from "../index.js";
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
		const me = await prisma.users.findUnique({
			where: {
				id: userId,
			}
		});
		if (!me) {
			console.error("You are not logged in");
			return reply.status(401).send({ message: "You are not logged in" });
		}

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

		const blocked = await prisma.blockedId.findFirst({
			where: {
				userId: userId,
				blockedId: friend.id,
			}
		});

		if (blocked) {
			console.error("You cannot add a blocked user as a friend");
			return reply.status(400).send({ message: "You cannot add a blocked user as a friend" });
		}

		const blockedBy = await prisma.blockedId.findFirst({
			where: {
				userId: friend.id,
				blockedId: userId,
			}
		});

		if (blockedBy) {
			console.error("You cannot add a user who blocked you as a friend");
			return reply.status(400).send({ message: "You cannot add a user who blocked you as a friend" });
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

			try {
				const response = await fetch("http://chat:5000/chat/create", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"x-user-id": userId.toString(), // header attendu par le microservice
					},
					body: JSON.stringify({
						members: [me.name, friend.name]
					})
				});

				if (!response.ok) {
					const errorBody = await response.text(); // au cas où l'erreur est informative
					console.warn("⚠️ La création de la conversation a échoué :", response.status, errorBody);
				} else {
					console.log("✅ Conversation créée ou existante après acceptation d'amitié.");
				}
			} catch (err) {
				console.error("❌ Erreur réseau lors de la création de la conversation :", err);
			}

			connectedSockets.get(friend.id)?.forEach(socket => {
			if (socket.readyState === socket.OPEN) {
				socket.send(JSON.stringify({
					type: "friendship_status_update",
					data: {
						friendshipId: existingFriendChip.id,
						status: "accepted",
						friend: {
							id: friend.id,
							name: friend.name,
							picture: friend.picture,
						},
					}
				}));
			}
		});

			return reply.status(201).send({
				message: `Friend request is now accepted`,
				friend: {
					id: friend.id,
					name: friend.name,
					picture: friend.picture
				}
			});
		}

		await prisma.friends.create({
			data: {
				senderId: userId,
				receiverId: friend.id,
			}
		});

		connectedSockets.get(friend.id)?.forEach((socket) => {
			if (socket.readyState === socket.OPEN) {
				socket.send(JSON.stringify({
					type: "friend_request",
					friend: {
						id: userId,
						name: me.name,
						picture: me.picture
					}
				}));
			}
		});
		console.log(`Demande d'ami envoyée de ${userId} à ${friendName}.`);

		return reply.status(201).send({
			message: `Friend request sent to ${friend.name}`,
			friend: {
				id: friend.id,
				name: friend.name,
				picture: friend.picture
			}
		});
	} catch (error) {
		console.error("Error server:" + error);
		return reply.status(500).send({ message: "Erreur serveur." });
	}
}
