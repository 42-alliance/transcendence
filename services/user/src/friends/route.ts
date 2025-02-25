import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../index.js";
import { extractUserId } from "../utils.js";

const StatusEnum = {
	pending: 'pending',
	accepted: 'accepted',
	rejected: 'rejected',
	blocked: 'blocked',
};

export async function addFriend(server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
	const userId = extractUserId(request);

	const { friendId, friendName } = request.body as { friendId: number, friendName: string };

	try {
		const friend = await prisma.users.findUnique({
			where: {
				id: friendId,
				name: friendName,
			}
		});

		if (friend === null) {
			console.error("This friend don't exist");
			return reply.status(400).send({ error: "This friend don't exist" });
		}

		await prisma.friends.create({
			data: {
				senderId: userId,
				receiverId: friendId,
			}
		});
		console.log(`Demande d'ami envoyée de ${userId} à ${friendName}.`);

		return reply.status(201).send({ message: `Friend request sent to ${friend.name}` });
	} catch (error) {
		console.error("Error server:" + error);
		return reply.status(500).send({ error: "Erreur serveur." });
	}
}

export async function updateFriendStatus(server: FastifyInstance, request: FastifyRequest<{Params: { friendId: string }}>, reply: FastifyReply) {
    const { friendId } = request.params;
	const userId = extractUserId(request);
    const { status } = request.body as { status: string };

	if (!Object.values(StatusEnum).includes(status)) {
		return reply.status(400).send({ error: 'Statut invalide' });
	}
	
	const fID = parseInt(friendId);
	
    try {
		const query = await prisma.friends.updateMany({
			where: {
				OR: [
					{
						senderId: userId,
						receiverId: fID,
					},
					{
						senderId: fID,
						receiverId: userId,
					},
				],
			},
			data: {
				status: status as keyof typeof StatusEnum,
			},
		});
		
		if (query.count === 0) {
			return reply.status(400).send({ message: "User not found in database" });
		}

        console.log(`Demande d'ami entre ${userId} et ${friendId} est maintenant ${status}.`);

        return reply.status(200).send({ message: `Friend request is now ${status}` });
    } catch (error) {
        console.error("Error server:" + error);
        return reply.status(500).send({ error: error });
    }
}

export async function removeFriend(server: FastifyInstance, request: FastifyRequest<{Params: { friendId: string }}>, reply: FastifyReply) {
	const { friendId } = request.params;

	const userId = extractUserId(request);
	
	const { friend_name } = request.body as {
		friend_name: string,
	};

	const fID = parseInt(friendId);
	try {
		const query = await prisma.friends.deleteMany({
			where:{
				OR : [
					{
						senderId: userId,
						receiverId: fID,
					},
					{
						senderId: fID,
						receiverId: userId,
					}
				]
			}
		})

		if (query.count === 0) {
			return reply.status(400).send({ message: "User not found in database" });
		}

		console.log(`Relation d'amitié supprimée entre ${userId} et ${friend_name}.`);
		
		return {message: `Friend deleted succesfully`};
	} catch (error) {
		console.error("Error server:" + error);
        return reply.status(500).send({ error: "Erreur serveur." });			
	}
}

export async function areFriends(server: FastifyInstance, request: FastifyRequest, reply: FastifyReply): Promise<boolean> {

	const userId = extractUserId(request);
	
	const { friend_id } = request.body as {
		friend_id: number,
	};

	try {
		const friend = await prisma.friends.findMany({
			where: {
				OR: [
					{
						senderId: userId,
						receiverId: friend_id,
					},
					{
						senderId: friend_id,
						receiverId: userId,
					}
				],
				AND: [
					{
						status: "accepted" as keyof typeof StatusEnum,
					}
				],
			}
		});

		
		console.error("are friend ? : ", friend.length >= 1);
        return reply.status(200).send({ message: friend.length >= 1 });		
	} catch (error) {
		console.error("Error server:" + error);
        return reply.status(500).send({ error: "Erreur serveur." });		
	}
}

export async function getFriends(server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
	try {
		const userId = extractUserId(request);

		const acceptedFriends = await prisma.$transaction([
		// L'utilisateur a envoyé la demande d'amitié
			prisma.friends.findMany({
				where: {
					senderId: userId,
					status: 'accepted'
				},
				include: {
					receiver: {
						select: {
							id: true,
							name: true,
							picture: true
						}
					}
				}
			}),
		
		// L'utilisateur a reçu la demande d'amitié
			prisma.friends.findMany({
				where: {
					receiverId: userId,
					status: 'accepted'
				},
				include: {
					sender: {
						select: {
							id: true,
							name: true,
							picture: true
						}
					}
				}
			})
	  ]);
	  
	  // Combiner et formater les résultats
	  const friendsList = [
		...acceptedFriends[0].map(friend => ({
		  id: Number(friend.receiver.id),
		  name: friend.receiver.name,
		  picture: friend.receiver.picture
		})),
		...acceptedFriends[1].map(friend => ({
		  id: Number(friend.sender.id),
		  name: friend.sender.name,
		  picture: friend.sender.picture
		}))
	  ];
	
	  const sortedFriendsList = friendsList.sort((a, b) => a.name.localeCompare(b.name));
	  return reply.status(200).send(sortedFriendsList);
	} catch (error) {
	  console.error("Error server:", error);
	  return reply.status(500).send({ error: "Erreur serveur." });
	}
}

export async function getPendingFriendRequest(server: FastifyInstance, request: FastifyRequest,reply: FastifyReply) {

	const userId = extractUserId(request);

    console.log("Getting pending requests for user:", userId);

    try {
		const incomingPendingRequests = await prisma.friends.findMany({
			where: {
			  receiverId: userId,
			  status: 'pending'
			},
			include: {
			  sender: true
			}
		});
		  
		const requestSenders = incomingPendingRequests.map(request => ({
			id: request.sender.id,
			name: request.sender.name,
			picture: request.sender.picture
		}));

        return reply.status(200).send(requestSenders);
    } catch (error) {
        console.error("Error server:", error);
        return reply.status(500).send({ error: "Erreur serveur." });
    }
}
