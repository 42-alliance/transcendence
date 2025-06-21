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

export async function getUserByName(
	request: FastifyRequest<{ Params: { name: string } }>,
	reply: FastifyReply
) {
	const { name } = request.params;

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
				created_at: Date;
			}[]
		>(`
			SELECT id, name, picture, banner, bio, is_online, created_at
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

		const common_friends_users = common_friends.map(friend => {
			return friend.senderId === user.id ? friend.receiver : friend.sender;
		});

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

		return reply.status(200).send({
			id: user.id,
    		name: user.name,
    		picture: user.picture,
    		banner: user.banner,
    		bio: user.bio,
    		created_at: user.created_at,
			status: user.is_online,
			common_friends: common_friends_users,
			games: user_games
		});
	} catch (error) {
		console.error("Unexpected error:", error);
		return reply.status(500).send({ error: "Internal server error" });
	}
}
