import { FastifyRequest } from "fastify";

export function extractUserId(request: FastifyRequest) {
	return Number(request.headers["x-user-id"] as string);
}