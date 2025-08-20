import { Type } from "@sinclair/typebox";
import { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import { config } from "../config.js";
import bcrypt from "bcrypt";
import { FastifyInstance } from "fastify/fastify.js";
import { error } from "console";

export const loginForm: FastifySchema = {
	body: Type.Object({
		email: Type.String(),
		password: Type.String(),
	}),
};

interface loginBody {
	email: string;
	password: string;
}

interface loginResponse {
	hash: string;
	user_id: number;
	twoFactorEnabled: boolean;
}

export async function login_by_pwd(
	server: FastifyInstance,
	request: FastifyRequest,
	reply: FastifyReply
) {
	const body: loginBody = request.body as loginBody;
	const headers = new Headers();
	try {
		const response = await fetch(
			`https://${config.users.host}:${config.users.port}/pwd-by-email/${body.email}`,
			{
				method: "GET",
				headers: headers,
			}
		);

		if (!response.ok) {
			if (response.status === 404) {
				return reply.status(404).send({ error: "Email not found" });
			}
			throw new Error("fail to resolve email " + response.statusText);
		}
		const result: loginResponse = await response.json();
		let pwd = result.hash;
		bcrypt.compare(body.password, pwd, function (result, err) {
			if (!result) {
				return reply.status(400).send({ error: "Incorrect password" });
			}
		});

		const accessToken = server.jwt.sign(
			{ id: result.user_id, type: "access_token" },
			{ expiresIn: "15m" }
		);
		const refreshToken = server.jwt.sign(
			{ id: result.user_id, type: "refresh_token" },
			{ expiresIn: "7d" }
		);

		if (result.twoFactorEnabled === false) {
			reply.setCookie("refresh_token", refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				path: "/",
				maxAge: 7 * 24 * 60 * 60, // 7 jours
			});
			return reply.send({
				access_token: accessToken,
				twoFactorEnabled: false,
			});
		} else {
			return reply.send({ twoFactorEnabled: true });
		}
	} catch (error: any) {
		return reply.status(500).send({ error: `Erreur serveur: ${error}` });
	}
}
