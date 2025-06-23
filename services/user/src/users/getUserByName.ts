import { Type } from "@sinclair/typebox";
import { prisma } from "../index.js";
import { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import { extractUserId } from "../utils.js";
import { config } from "../config.js";

export const getUserByNameSchema: FastifySchema = {
	headers: Type.Object({
		"x-user-id": Type.String({ pattern: "^[0-9]+$" }),
	}),
	params: Type.Object({
		name: Type.String({pattern: config.name_pattern, }),
	})
};

export async function getUserByName(
	request: FastifyRequest<{ Params: { name: string } }>,
	reply: FastifyReply
) {
	const { name } = request.params;

	console.log("getUserByName called with name:", name);

	console.log("body", request.body);


	
	try {
		// Utilisation de $queryRawUnsafe pour insérer dynamiquement la valeur de name
		const users = await prisma.$queryRawUnsafe<
			{
				id: number;
				name: string;
				picture: string;
				is_online: string;
				banner: string | null;
				bio: string | null;
				lastSeen: Date;
				created_at: Date;
			}[]
		>(`
			SELECT id, name, picture, banner, bio, is_online, created_at, lastSeen
			FROM Users
			WHERE LOWER(name) = LOWER(${JSON.stringify(name)})
			LIMIT 1;
		`);

		const user = users[0];

		if (!user) {
			console.error("User not found");
			return reply.status(404).send({ error: "User not found" });
		}

		const user_id = extractUserId(request);

		let common_friends = await prisma.friends.findMany({
			where: {
				status: "accepted",
				OR: [
					{ senderId: user.id },
					{ receiverId: user.id }
				]
			},
			include: {
				sender: {
					select: {
						id: true,
						name: true,
						picture: true,
						banner: true,
						bio: true,
						created_at: true
					}
				},
				receiver: {
					select: {
						id: true,
						name: true,
						picture: true,
						banner: true,
						bio: true,
						created_at: true
					}
				}
			}
		});

		const user_friends = common_friends.map(friend => {
			return friend.senderId === user.id ? friend.receiver : friend.sender;
		});

		const my_friends = await prisma.friends.findMany({
			where: {
				status: "accepted",
				OR: [
					{ senderId: user_id },
					{ receiverId: user_id }
				]
			},
			include: {
				sender: {
					select: {
						id: true,
						name: true,
						picture: true,
						banner: true,
						bio: true,
						created_at: true
					}
				},
				receiver: {
					select: {
						id: true,
						name: true,
						picture: true,
						banner: true,
						bio: true,
						created_at: true
					}
				}
			}
		});

		const my_friends_users = my_friends.map(friend => {
			return friend.senderId === user.id ? friend.receiver : friend.sender;
		});

		const common_friends_users = user_friends.filter(friend =>
			my_friends_users.some(myFriend => myFriend.id === friend.id)
		).map(friend => ({
			id: friend.id,
			name: friend.name,
			picture: friend.picture,
			banner: friend.banner,
			bio: friend.bio,
			created_at: friend.created_at,
		}));

		const user_games = await prisma.game.findMany({
			where: {
				OR: [
					{ player1Id: user.id },
					{ player2Id: user.id }
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

		let delta = Date.now() - user.lastSeen.getTime();

		return reply.status(200).send({
			id: user.id,
    		name: user.name,
    		picture: user.picture,
    		banner: user.banner,
    		bio: user.bio,
    		created_at: user.created_at,
			status: user.is_online === "online" && delta < 10 * 60 * 1000 ? "online" : user.is_online === "offline" ? "offline" : "away",
			common_friends: common_friends_users,
			games: user_games
		});
	} catch (error) {
		console.error("Unexpected error:", error);
		return reply.status(500).send({ error: "Internal server error" });
	}
}
