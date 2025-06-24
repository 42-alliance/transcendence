import { FastifyRequest } from "fastify";

export function extractUserId(request: FastifyRequest) {
	return Number(request.headers["x-user-id"] as string);
}

export function generateRandomString(length: number) {
	let result = "";
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

export function getStatus(status: string, last_seen: Date): string {
	const delta = Date.now() - new Date(last_seen).getTime();
	return status === "online" && delta < 10 * 60 * 1000 ? "online" : status === "offline" ? "offline" : "away";
}