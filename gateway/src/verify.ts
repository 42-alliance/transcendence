import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

export async function verifyJWT(server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
	try {
		await request.jwtVerify(); // Verifies token & stores it in `request.user`

		const decoded = request.user as { id: number }; // Extract user info
		if (!decoded || !decoded.id) {
			throw new Error("Invalid JWT payload");
		}

    request.headers['x-user-id'] = String(decoded.id); // Attach `userId` to headers
	} catch (error: any) {
		console.error("❌ [JWT Error]", error);
		return reply.status(error.statusCode || 401).send({ error: "Unauthorized" });
	}
}
