import { Type } from "@sinclair/typebox";
import { FastifyReply, FastifyRequest, FastifySchema } from "fastify";

export const logoutUserSchema: FastifySchema = {
	headers: Type.Object({
		"x-user-id": Type.String({ pattern: "^[0-9]+$" }),
	})
};

export async function logoutUser(request: FastifyRequest, reply: FastifyReply) {
	try {
		reply.clearCookie("refresh_token", {domain: "localhost", path: "/"});
		reply.status(200).send({ message: "user successfuly logout"});
	} catch (error) {
		console.error("Error: ", error);
		reply.status(500).send({ error: "Error: " + error});
	}
}
