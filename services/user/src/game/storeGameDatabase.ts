import { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import { prisma } from "../index.js";
import { Type } from "@sinclair/typebox";

export const storeGameDatabaseSchema: FastifySchema = {
	body: Type.Object({
		mode: Type.String(),
		status: Type.String(),
		score1: Type.Integer(),
		score2: Type.Integer(),
		players: Type.Array(
			Type.Object({
				id: Type.Integer(),
				name: Type.String(),
			})
		),
		winner: Type.Integer({ nullable: true }),
		startTime: Type.Date(),
		finished_at: Type.Date({ nullable: true }),
	}),
}

interface player {
	id: number;
	name: string;
}

export async function storeGameDatabase(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {

	const game = request.body as {
		mode: string;
		status: string;
		score1: number;
		score2: number;
		players: player[];
		winner: number | null;
		startTime: Date;
		finished_at: Date;
	}

	console.log('Storing game database:', game);

	const game_store = await prisma.game.create({
	  data: {
		mode: game.mode,
		status: game.status,
		score1: game.score1,
		score2: game.score2,
		player1Id: game.players[0].id,
		player2Id: game.players[1].id,
		player1_name: game.players[0].name,
		player2_name: game.players[1].name,
		winner: game.winner,
		started_at: game.startTime,
		finished_at: game.finished_at,
	  },
	});	
	
	reply.status(201).send({
	  message: "Game database stored successfully",
	  gameId: game_store.id,
	});
  } catch (error) {
	console.error('Error storing game database:', error);
	return reply.status(500).send({
	  message: "Failed to store game database",
	  error: error instanceof Error ? error.message : "Unknown error",
	});
  }
}