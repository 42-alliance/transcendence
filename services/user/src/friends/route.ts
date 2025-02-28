import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../index.js";
import { extractUserId } from "../utils.js"

// POST
export async function addFriend(server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
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
			return reply.status(400).send({message: "Friend request already exists"});
		}

		const oui = await prisma.friends.create({
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

// DELETE
export async function removeFriend(server: FastifyInstance, request: FastifyRequest<{ Params: { friendId: string } }>, reply: FastifyReply) {
	const { friendId } = request.params;
	const userId = extractUserId(request);

	// Vérifiez si friendId est manquant
	if (!friendId) {
		return reply.status(400).send({ message: "Friend ID is required" });
	}
	
	const fID = Number(friendId);
	if (isNaN(fID)) {
	  return reply.status(400).send({ message: "Invalid friend ID" });
	}
  
	try {
	  const query = await prisma.friends.deleteMany({
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
	  });
  
	  if (query.count === 0) {
		return reply.status(400).send({ message: "Relation not found in database" });
	  }
  
	  return { message: "Friend deleted successfully" };
	} catch (error) {
	  console.error("Error server:", error);
	  return reply.status(500).send({ message: "Internal server error" });
	}
}

// GET
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

