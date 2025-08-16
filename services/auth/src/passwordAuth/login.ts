import { Type } from "@sinclair/typebox";
import { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import { config } from "../config.js";
import bcrypt from "bcrypt";


export const loginForm: FastifySchema = {
    body: Type.Object({
        email: Type.String(),
        password: Type.String(),
    }),
}

interface loginBody {
    email: string;
    password: string;
}

interface loginResponse {
    hash: string,
}

export async function login_by_pwd(request: FastifyRequest, reply: FastifyReply) {
    const body: loginBody = request.body as loginBody;
    const headers = new Headers();
    try {
        const response = await fetch(`https://${config.users.host}:${config.users.port}/pwd-by-email/${body.email}`, {
            method: "GET",
            headers: headers,
        });

        if (response.ok)
            throw new Error("fail to resolve email " + response.statusText);
        const result: loginResponse = await response.json();
    }
}