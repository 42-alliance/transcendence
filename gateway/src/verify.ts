import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

export async function verifyJWT(server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
	try {
		const token = await request.jwtVerify();
		console.log("token", token);
		
		request.user = token;
	} catch (error: any) {
		console.error("❌ [JWT Error]", error);

		console.error("[error] - Error name => ", error.name);
		return reply.status(error.statusCode).send({ error: error });
	}
}