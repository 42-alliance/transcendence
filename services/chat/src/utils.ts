import { User } from "./types.js";
import { config } from "./config.js";
import { FastifyRequest } from "fastify";

// Fonction utilitaire pour vérifier si un utilisateur existe
export async function checkIfUserExist(username: string, userId: number) {
	const headers = new Headers();
	headers.set("x-user-id", userId.toString());

	const url = `https://${config.users.host}:${config.users.port}/users/${encodeURIComponent(username)}`;
	const response = await fetch(url, { method: "GET", headers });
	if (!response.ok) {
		let body = "";
		try { body = await response.text(); } catch {}
		throw new Error(`User lookup failed for '${username}': ${response.status} ${response.statusText} ${body}`);
	}
	const user: User = await response.json();
	return user;
}

export async function getUserById(userId: number) {
	const headers = new Headers();
	headers.append("x-user-id", userId.toString());

	const url = `https://${config.users.host}:${config.users.port}/users/@me`;
	const response = await fetch(url, { method: "GET", headers });
	if (!response.ok) {
		let body = "";
		try { body = await response.text(); } catch {}
		throw new Error(`Error when get user Info: ${response.status} ${response.statusText} ${body}`);
	}
	const user: User = await response.json();
	return user;
}

export function extractUserIdHeader(request: FastifyRequest) {
	return Number(request.headers["x-user-id"] as string);
}