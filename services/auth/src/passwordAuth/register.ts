import { Type } from "@sinclair/typebox";
import { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import { config } from "../config.js";
import bcrypt from "bcrypt";


export const registerForm: FastifySchema = {
    body: Type.Object({
        name: Type.String(),
        picture: Type.String(),
        email: Type.String(),
        password: Type.String(),
    }),
}

interface registerBody {
    name: string;
    picture: string;
    email: string;
    password: string;
}

interface registerResponse {
    hash: string,
}

export async function register_by_pwd(request: FastifyRequest, reply: FastifyReply) {
    const body: registerBody = request.body as registerBody;
    const headers = new Headers();
    headers.append("Content-Type", "application/json")
    try {
        const response = await fetch(`https://${config.users.host}:${config.users.port}/user-pwd`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                name: body.name,
                email: body.email,
                picture: body.picture,
                password: body.password,
            })
        });

        if (!response.ok)
            throw new Error("fail to resolve email :" + response.statusText);
    } catch (error: any) {
        return reply.status(500).send({error: `Erreur serveur: ${error}`});
    } 
    return reply.status(200).send({message: "all right okay"});
}
