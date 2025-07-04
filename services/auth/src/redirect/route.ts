import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { config } from "../config.js";

export async function authRedirect(server: FastifyInstance, request: FastifyRequest, reply: FastifyReply ) {
    const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/auth";
    const REDIRECT_URI = `https://${config.gateway.host}:${config.gateway.port}/auth/callback`;
    const CLIENT_ID = config.client.id;

	const queryParams = new URLSearchParams({
        scope: "email profile",
        redirect_uri: REDIRECT_URI,
        response_type: "code",
        client_id: CLIENT_ID
    });

    return reply.status(200).send({ auth_url: `${GOOGLE_AUTH_URL}?${queryParams.toString()}` });
}
