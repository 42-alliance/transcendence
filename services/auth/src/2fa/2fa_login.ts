import { Type } from "@sinclair/typebox";
import {
	FastifyInstance,
	FastifyReply,
	FastifyRequest,
	FastifySchema,
} from "fastify";
import { config } from "../config.js";
import { error } from "console";

export const Twofa_loginSchema: FastifySchema = {
	body: Type.Object({
		code: Type.String({ pattern: "[0-9]{6}" }),
		id: Type.Number(),
	}),
};

interface Twofa_loginBody {
	code: string;
	id: number;
}

export async function Twofa_login(
	server: FastifyInstance,
	request: FastifyRequest,
	reply: FastifyReply
) {
	const body = request.body as Twofa_loginBody;

	try {
		const header = new Headers();
		header.append("Content-Type", "application/json");

		const response = await fetch(
			`https://${config.users.host}:${config.users.port}/internal/try-2fa`,
			{
				method: "POST",
				headers: header,
				body: JSON.stringify({
					code: body.code,
					id: body.id,
				}),
			}
		);

		if (!response.ok) {
			return reply.status(400).send({ error: "Error in the 2fa code" });
		}

		const accessToken = server.jwt.sign(
			{ id: body.id, type: "access_token" },
			{ expiresIn: "15m" }
		);
		const refreshToken = server.jwt.sign(
			{ id: body.id, type: "refresh_token" },
			{ expiresIn: "7d" }
		);

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
	} catch (error) {
		console.log("Error: ", error);
		return reply.status(500).send({ error: "Internal server error" });
	}
}
