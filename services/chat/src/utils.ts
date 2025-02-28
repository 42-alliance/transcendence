import { User } from "./types.js";
import { config } from "./config.js";
import { FastifyRequest } from "fastify";

// Fonction utilitaire pour vérifier si un utilisateur existe
export async function checkIfUserExist(username: string) {
	const headers = new Headers();
	const response = await fetch(`http://${config.users.host}:${config.users.port}/users/${username}`, {
	  method: "GET",
	  headers: headers,
	});
	if (!response.ok) {
	  throw new Error("Error when check If User Exist");
	}
	const user: User = await response.json();
	return user;
}

export async function getUserById(userId: number) {
	const headers = new Headers();
	headers.append("x-user-id", userId.toString());

	const response = await fetch(`http://${config.users.host}:${config.users.port}/users/@me`, {
	  method: "GET",
	  headers: headers,
	});
	if (!response.ok) {
	  throw new Error("Error when get user Info");
	}
	const user: User = await response.json();
	return user;
}


export function extractUserIdHeader(request: FastifyRequest) {
	return Number(request.headers["x-user-id"] as string);
}