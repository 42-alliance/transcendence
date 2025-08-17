import { Type } from "@sinclair/typebox";
import { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import { config } from "../config.js";
import bcrypt from "bcrypt";
import { FastifyInstance } from "fastify/fastify.js";


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

export async function register_by_pwd(server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
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

		const result = await response.json();

		const accessToken = server.jwt.sign(
            { id: result.id, type: "access_token" },
            { expiresIn: "15m" }
        );
        const refreshToken = server.jwt.sign(
            { id: result.id, type: "refresh_token" },
            { expiresIn: "7d" }
        );

        reply.setCookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 7 * 24 * 60 * 60, // 7 jours
        });

		if (response.status === 200) {
			return reply.status(200).send({redirect_url: `https://localhost:8080/auth-success?token=${accessToken}`, access_token: accessToken});

		}
		if (response.status === 201) {
			return reply.status(201).send({redirect_url: `https://localhost:8080/auth-success?token=${accessToken}&register=true`, access_token: accessToken});
		}
			// return reply.redirect(`https://localhost:8080/auth-success?token=${accessToken}&register=true`);
    } catch (error: any) {
        return reply.status(500).send({error: `Erreur serveur: ${error}`});
    } 
    return reply.status(200).send({message: "all right okay"});
}
