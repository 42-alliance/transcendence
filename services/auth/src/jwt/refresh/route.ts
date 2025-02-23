import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

function isTimestampWithin15Minutes(exp: string): boolean {
	const expDate = new Date(exp);
	const now = new Date();
	
	return now.getTime() / 1000 < expDate.getTime();
}

export async function refreshJWT(server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
	try {
		const refreshToken = request.cookies.refresh_token;
		const lastAccessToken = request.body as {
			token: string
		};

		if (!refreshToken) {
			return reply.status(401).send({ error: "Missing refresh token" });
		}

		const decoded = server.jwt.verify(refreshToken) as { id: string, type: string };
		if(!decoded.id || !decoded.type || decoded.type !== "refresh_token") {
			return reply.status(401).send({ error: "Token integrity has been compromised"});
		}
		console.log("Decoded Refresh Token:", decoded);

		const lastAccessTokenDecoded = server.jwt.decode(lastAccessToken.token) as { id: string, type: string, exp: string };
		
		if(!lastAccessTokenDecoded.id || !lastAccessTokenDecoded.type || !lastAccessTokenDecoded.exp || lastAccessTokenDecoded.type !== "access_token") {
			return reply.status(401).send({ error: "Token integrity has been compromised"});
		}
		
		console.log("Decoded Access Token:", lastAccessTokenDecoded);
		if (isTimestampWithin15Minutes(lastAccessTokenDecoded.exp)) {
			console.error(`[verify] - Access token expired => exp (${lastAccessTokenDecoded.exp})`);
			return reply.status(200).send({ access_token: lastAccessToken.token});
		}

		// si les ids des tokens ne correspondent pas
		if (lastAccessTokenDecoded.id !== lastAccessTokenDecoded.id) {
			console.error(`[verify] - Tokens mistmatch => decoded id (${decoded.id}) | access Token id (${lastAccessTokenDecoded.id})`);
			return reply.status(401).send({ error: "Access token and refresh token mismatch" });
		}

		const accessToken = server.jwt.sign(
			{
				id: decoded.id,
				type: "access_token"
			},
			{ expiresIn: "15m" }
		);

		reply.setCookie("refresh_token", refreshToken, {
			httpOnly: true,
            secure: process.env.NODE_ENV === "production", // HTTPS en prod
            path: "/",
            maxAge: 15 * 24 * 60 * 60, // 7 jours
        });

		return reply.status(200).send({ access_token: accessToken });
	} catch (error) {
		console.error("Error refreshing JWT:", error);
		return reply.status(401).send({ error: "Invalid or expired refresh token" });
	}
}
