import { prisma } from "../../index.js";

export async function getPendingFriendRequest(userId: number) {

	console.log("Getting pending requests for user:", userId);

	try {
		// Demandes reçues (incoming)
		const incomingPendingRequests = await prisma.friends.findMany({
			where: {
				receiverId: userId,
				status: 'pending'
			},
			include: {
				sender: true
			}
		});

		// Demandes envoyées (outgoing)
		const outgoingPendingRequests = await prisma.friends.findMany({
			where: {
				senderId: userId,
				status: 'pending'
			},
			include: {
				receiver: true
			}
		});

		const incoming = incomingPendingRequests.map(request => ({
			type: 'incoming',
			user: {
				id: request.sender.id,
				name: request.sender.name,
				picture: request.sender.picture,
				banner: request.sender.banner,
				bio: request.sender.bio,
				status: request.sender.is_online,
				created_at: request.sender.created_at,
			},
			request_since: request.created_at
		}));

		incoming.sort((a, b) => new Date(a.request_since).getTime() - new Date(b.request_since).getTime());

		const outgoing = outgoingPendingRequests.map(request => ({
			type: 'outgoing',
			user: {
				id: request.receiver.id,
				name: request.receiver.name,
				picture: request.receiver.picture,
				banner: request.receiver.banner,
				bio: request.receiver.bio,
				status: request.receiver.is_online,
				created_at: request.receiver.created_at,
			},
			request_since: request.created_at
		}));

		outgoing.sort((a, b) => new Date(a.request_since).getTime() - new Date(b.request_since).getTime());

		return {
			incoming,
			outgoing
		};
	} catch (error) {
		console.error("Error server:", error);
		throw error; // Propagate the error to be handled by the caller
	}
}
