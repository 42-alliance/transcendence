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