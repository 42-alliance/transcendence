import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { createUser, getUserById } from '../gRPC/grpc-client.js';

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
        const userInfo = await getUserGoogleInfo(code);

        const user = await createUser(userInfo.picture, userInfo.given_name);

		const userTest = await getUserById(user.id);

		console.log("[test] - grpc respose => ", userTest);

        // Génération des tokens
        const accessToken = server.jwt.sign(
            { id: user.id, type: "access_token" },
            { expiresIn: "15m" }
        );
        const refreshToken = server.jwt.sign(
            { id: user.id, type: "refresh_token" },
            { expiresIn: "7d" }
        );

        reply.setCookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 7 * 24 * 60 * 60, // 7 jours
        });

        return reply.status(200).send({
            message: "Authentification réussie",
            accessToken,
        });

    } catch (error) {
        console.error("❌ Erreur d'authentification :", error);
        return reply.status(500).send({ error: "Erreur d'authentification" });
    }
}
