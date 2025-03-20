import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

function isExpired(exp: number): boolean {
	const now = Math.floor(Date.now() / 1000); // Timestamp actuel en secondes
	return exp < now;
}

export async function refreshJWT(server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
	try {
		const refreshToken = request.cookies.refresh_token;
		const lastAccessToken = request.body as { token: string };

		if (!refreshToken) {
			return reply.status(401).send({ error: "Missing refresh token" });
		}

		// Vérifier le refresh token
		const decoded = server.jwt.verify(refreshToken) as { id: string, type: string };
		if (!decoded.id || decoded.type !== "refresh_token") {
			return reply.status(401).send({ error: "Token integrity has been compromised" });
		}
		console.log("Decoded Refresh Token:", decoded);

		// Décoder l'Access Token sans le vérifier
		const lastAccessTokenDecoded = server.jwt.decode(lastAccessToken.token) as { id: string, type: string, exp: number };

		if (!lastAccessTokenDecoded?.id || lastAccessTokenDecoded?.type !== "access_token") {
			return reply.status(401).send({ error: "Token integrity has been compromised" });
		}

		console.log("Decoded Access Token:", lastAccessTokenDecoded);

		// Si l'Access Token est encore valide, on ne doit pas le régénérer
		if (!isExpired(lastAccessTokenDecoded.exp)) {
			console.log("[verify] - Access token still valid");
			return reply.status(200).send({ access_token: lastAccessToken.token });
		}

		// Vérifier que les IDs des tokens correspondent
		if (decoded.id !== lastAccessTokenDecoded.id) {
			console.error(`[verify] - Tokens mismatch => refresh token id (${decoded.id}) | access token id (${lastAccessTokenDecoded.id})`);
			return reply.status(401).send({ error: "Access token and refresh token mismatch" });
		}

		// Générer un nouveau access token
		const accessToken = server.jwt.sign(
			{
				id: decoded.id,
				type: "access_token"
			},
			{ expiresIn: "1j" }
		);

		// Réémettre le refresh token (optionnel, si on veut renouveler sa durée de vie)
		reply.setCookie("refresh_token", refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			path: "/",
			maxAge: 15 * 24 * 60 * 60, // 7 jours
		});

		return reply.status(200).send({ access_token: accessToken });

	} catch (error) {
		console.error("Error refreshing JWT:", error);
		return reply.status(401).send({ error: "Invalid or expired refresh token" });
	}
}

