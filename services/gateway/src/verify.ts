import { FastifyRequest, FastifyReply } from "fastify";

export async function verifyJWT(request: FastifyRequest, reply: FastifyReply) {
	try {
		await request.jwtVerify();

		const decoded = request.user as { id: number, type: string };
		if (!decoded || !decoded.id) {
			throw new Error("Invalid JWT payload");
		}

		if (decoded.type !== "access_token") {
			throw new Error("Invalid token type");
		}

		console.log("✅ [JWT] decode:", decoded);

    	request.headers['x-user-id'] = String(decoded.id);
	} catch (error: any) {
		console.error("❌ [JWT Error]", error);
		return reply.status(error.statusCode || 401).send({ error: "Unauthorized" });
	}
}
