import { FastifyInstance, FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import { prisma } from "../../index.js";
import { extractUserId, getStatus } from "../../utils.js"
import { Type } from "@sinclair/typebox";
import { getPendingFriendRequest } from "../../friends/pending/getPendingRequest.js";
import { get } from "http";

export const meSchema: FastifySchema = {
	headers: Type.Object({
		"x-user-id": Type.String({ pattern: "^[0-9]+$" }),
	})
};

export async function me(request: FastifyRequest, reply: FastifyReply): Promise<object[]> {
    const userId = extractUserId(request);

    try {
        const me = await prisma.users.findUnique({
            where: {
                id: userId,
            },
        });

        if (!me) {
            return reply.status(404).send({message: "User not found"});
        }

        const friendsList = await prisma.friends.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ],
                status: "accepted"
            },
            include: {
                receiver: true,
                sender: true
            }
        });


		const blockedUsers = await prisma.blockedId.findMany({
			where: {
				userId: userId,
			},
			select: {
				blocked: true
			}
		});

		const blockList = blockedUsers.map(blocked => ({
			id: blocked.blocked.id,
			name: blocked.blocked.name,
			picture: blocked.blocked.picture,
			bio: blocked.blocked.bio,
			banner: blocked.blocked.banner
		}));

		const games = await prisma.game.findMany({
			where: {
				OR: [
					{ player1Id: userId },
					{ player2Id: userId }
				]
			},
			orderBy: {
				started_at: 'desc'
			},
			select: {
				id: true,
				mode: true,
				status: true,
				score1: true,
				score2: true,
				player1Id: true,
				player2Id: true,
				player1_name: true,
				player2_name: true,
				winner: true,
				started_at: true,
				finished_at: true,
				player1: {
					select: {
						id: true,
						name: true,
						picture: true,
						bio: true,
						banner: true,
						created_at: true,
						is_online: true,
						lastSeen: true
					}
				},
				player2: {
					select: {
						id: true,
						name: true,
						picture: true,
						bio: true,
						banner: true,
						created_at: true,
						is_online: true,
						lastSeen: true
					}
				}
			}
		});

		const victories = games.filter(game => game.winner === userId).length;
		const defeats = games.filter(game => game.winner !== userId && game.winner !== null).length;
		const draws = games.filter(game => game.winner === null).length;

        const friends = friendsList.map(friendship => {
            const friend = friendship.senderId === userId ? friendship.receiver : friendship.sender;
            return {
                id: friend.id,
                name: friend.name,
                picture: friend.picture,
				banner: friend.banner,
				bio: friend.bio,
				status: getStatus(friend.is_online, friend.lastSeen),
                created_at: friend.created_at
            };
        });

		const { incoming, outgoing } = await getPendingFriendRequest(userId);

        return reply.status(200).send({
			id: me.id,
			name: me.name,
			picture: me.picture,
            email: me.email,
			banner: me.banner,
			bio: me.bio,
			last_seen: me.lastSeen,
			status: me.is_online,
			created_at: me.created_at,
			friends: friends,
			incoming_friends: incoming,
			outgoing_friends: outgoing,
			blocked: blockList,
			games: games,
			victories: victories,
			defeats: defeats,
			draws: draws
        });
    } catch (e) {
        return reply.status(500).send({error: e});
    }
}
