import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export async function authRedirect(server: FastifyInstance, request: FastifyRequest, reply: FastifyReply ) {
    const base_url: string = "https://accounts.google.com/o/oauth2/auth";
    const redirect_uri: string = "http://localhost:3000/auth/callback"
    const client_id: string | null = process.env.CLIENT_ID || null;
    
    if (!client_id)
        return reply.status(500).send({error: 'Une erreur est survenue'})
    const url: string = `${base_url}?scope=email&redirect_uri=${redirect_uri}&response_type=code&client_id=${client_id}`;

    return reply.status(302).redirect(url);
}