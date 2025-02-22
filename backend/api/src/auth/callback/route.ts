import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

async function getUserGoogleInfo(code: string) {
    const tokenUrl = "https://oauth2.googleapis.com/token";
    const userInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo";

    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("client_id", process.env.CLIENT_ID!);
    params.append("client_secret", process.env.CLIENT_SECRET!);
    params.append("code", code);
    params.append("redirect_uri", "http://localhost:3000/auth/callback");

    try {
        // 1. Échanger le code contre un token d'accès
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
		
        // 2. Récupérer les infos utilisateur
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
        const userInfo = await getUserGoogleInfo(code);

        let user = await server.db.get("SELECT * FROM users WHERE id = ?", [userInfo.id]);

        if (!user) {
            await server.db.run(
                "INSERT INTO users (id, name, picture) VALUES (?, ?, ?)",
                [userInfo.id, userInfo.given_name, userInfo.picture]
            );

            user = await server.db.get("SELECT * FROM users WHERE id = ?", [userInfo.id]);
        }

        if (!user) {
            throw new Error("L'utilisateur ne peut pas être récupéré après insertion.");
        }

        // Générer un JWT
        const token = server.jwt.sign({ id: user.id });
        console.log("✅ JWT généré :", token);

        return reply.status(200).send({
            message: "Authentification réussie",
            token,
            user,
        });

    } catch (error) {
        console.error("❌ Erreur d'authentification :", error);
        return reply.status(500).send({ error: "Erreur d'authentification" });
    }
}
