import { Games } from "./types.js";


export function nbGames(games: Games[]): number {
    if (!games || !Array.isArray(games)) {
		return 0;
	}
	return games.length;
}

export function nbWins(games: Games[], userId: number): number {
	if (!games || !Array.isArray(games)) {
		return 0;
	}
	return games.filter(game => game.winner === userId).length;
}

export function nbLosses(games: Games[], userId: number): number {
	if (!games || !Array.isArray(games)) {
		return 0;
	}
	return games.filter(game => game.winner !== userId).length;
}

export function nbRagequits(games: Games[], userId: number): number {
	if (!games || !Array.isArray(games)) {
		return 0;
	}
	return games.filter(game => game.winner !== userId && game.status === "ragequit").length;
}