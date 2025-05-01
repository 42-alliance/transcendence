import { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import { extractUserId } from "../utils.js";
import { config } from "../config.js";
import { Type } from "@sinclair/typebox";

export const deleteUserSchema: FastifySchema = {
	headers: Type.Object({
		"x-user-id": Type.String({ pattern: "^[0-9]+$" }),
	}),
}

export async function deleteUser(request: FastifyRequest, reply: FastifyReply) {
	try {
		const userId  = extractUserId(request);

		const headers = new Headers();
		headers.append("x-user-id", userId.toString());

		const response = await fetch(`http://${config.users.host}:${config.users.port}/users`,{
			method: "DELETE",
			headers: headers,
		});

		if (!response.ok)
			throw new Error("fail to delete user " + response.statusText);

		reply.clearCookie("refresh_token", {domain: "localhost", path: "/"});

		const result = await response.json();
		return reply.status(200).send(result);
	} catch (error) {
		console.error("Error: ", error);
		return reply.status(500).send({ error: "Error: " + error});
	}
}