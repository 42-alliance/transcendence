import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

async function getUserGoogleInfo(code: string) {
    const tokenUrl = "https://oauth2.googleapis.com/token";
    const userInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo";

    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("client_id", process.env.CLIENT_ID!);
    params.append("client_secret", process.env.CLIENT_SECRET!);
    params.append("code", code);
    params.append("redirect_uri", "http://localhost:8000/auth/callback");

    try {
        const tokenResponse = await fetch(tokenUrl, {
			method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params.toString(),
        });
		
        if (!tokenResponse.ok) {
			throw new Error("Échec de la récupération du token d'accès");
        }
		
        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;
		
        const userInfoResponse = await fetch(userInfoUrl, {
			method: "GET",
            headers: { Authorization: `Bearer ${accessToken}` },
        });
		
        if (!userInfoResponse.ok) {
			throw new Error("Échec de la récupération des infos utilisateur");
        }
        const userInfo = await userInfoResponse.json();
        return userInfo;
    } catch (error) {
        console.error("[Google OAuth Error]", error);
        throw error;
    }
}

export async function authCallback(server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
    const { code } = request.query as { code: string };

    if (!code) {
        console.error("❌ Code d'autorisation manquant");
        return reply.status(400).send({ error: "Code d'autorisation manquant" });
    }

    try {
		console.error("❌test1");
        const userInfo = await getUserGoogleInfo(code);
		
		console.error("❌test2");
        let user = await server.db.get("SELECT * FROM users WHERE id = ?", [userInfo.id]);
		
		console.error("	❌user", user);
		console.error("❌test3");
		
        if (!user) {
			await server.db.run(
				"INSERT INTO users (id, name, picture) VALUES (?, ?, ?)",
                [userInfo.id, userInfo.given_name, userInfo.picture]
            );
			
            user = await server.db.get("SELECT * FROM users WHERE id = ?", [userInfo.id]);
        }
		console.error("❌test5");
		
        if (!user) {
			throw new Error("L'utilisateur ne peut pas être récupéré après insertion.");
        }
		console.error("❌test6");
		const accessToken = server.jwt.sign({ id: user.id }, { expiresIn: "1m" });
		const refreshToken = server.jwt.sign({ id: user.id }, { expiresIn: "7d" });
		
		reply.setCookie("refreshToken", refreshToken, {
			httpOnly: true,
            secure: process.env.NODE_ENV === "production", // HTTPS en prod
            path: "/",
            maxAge: 7 * 24 * 60 * 60, // 7 jours
        });
		
		console.error("❌test7");
        return reply.status(200).send({
            message: "Authentification réussie",
            accessToken,
            user,
        });

    } catch (error) {
        console.error("❌ Erreur d'authentification :", error);
        return reply.status(500).send({ error: "Erreur d'authentification" });
    }
}
