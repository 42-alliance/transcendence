import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export async function authRedirect(server: FastifyInstance, request: FastifyRequest, reply: FastifyReply ) {
    const base_url = "https://accounts.google.com/o/oauth2/auth";
    const redirect_uri = "http://localhost:8000/auth/callback";
    const client_id = process.env.CLIENT_ID;

    if (!client_id)
        return reply.status(500).send({error: 'Une erreur est survenue'});

    const url = `${base_url}?scope=email%20profile&redirect_uri=${redirect_uri}&response_type=code&client_id=${client_id}`;

    return reply.status(302).redirect(url);
}
