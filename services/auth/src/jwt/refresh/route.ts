import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export async function refreshJWT(server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
	try {
		const refreshToken = request.cookies.refresh_token;
		if (!refreshToken) {
			return reply.status(401).send({ error: "Missing refresh token" });
		}

		const decoded = server.jwt.verify(refreshToken) as { id: string };
		console.log("Decoded Refresh Token:", decoded);

		const accessToken = server.jwt.sign(
			{ id: decoded.id },
			{ expiresIn: "15m" }
		);

		return reply.status(200).send({ access_token: accessToken });
	} catch (error) {
		console.error("Error refreshing JWT:", error);
		return reply.status(401).send({ error: "Invalid or expired refresh token" });
	}
}
