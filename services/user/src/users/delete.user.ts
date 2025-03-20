import { config } from "../config.js";
import { extractUserId } from "../utils.js";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../index.js";

export async function deleteMediaFile(file_url: string) {
	try {
		// Extract the filename from the URL
		const url = new URL(file_url);
		const filepath = url.pathname.split('/').pop() || ""; // Get the last part of the pathname
	
		const headers = new Headers();
		const response = await fetch(`http://${config.media.host}:${config.media.port}/files/${filepath}`, {
			method: "DELETE",
			headers: headers,
		});
	
		if (!response.ok)
			throw new Error(`Failed to delete ${filepath}`);
	} catch (error) {
		console.log("Error deleteMediaFile: ", error);		
	}
}

/**
 * Route DELETE `/users` - Supprime un utilisateur de la base de données.
 *
 * @param {FastifyRequest} request - Requête HTTP.
 * @param {FastifyReply} reply - Réponse HTTP.
 * @returns {Promise<void>}
 */
export async function deleteUserDatabase(server: FastifyInstance, request: FastifyRequest, reply: FastifyReply): Promise<void> {
	try {
		const userId = extractUserId(request);
		if (!userId) {
			return reply.status(400).send({ message: "Invalid user ID" });
		}

		const user = await prisma.users.findUniqueOrThrow({
			where: { id: userId }
		});

		
		deleteMediaFile(user.picture);
		if (user.banner)
			deleteMediaFile(user.banner);

		await prisma.users.delete({
			where: { id: userId }
		});

		reply.clearCookie("refresh_token", { path: "/" });
		reply.status(200).send({ message: "User successfully deleted" });
	} catch (error) {
		console.error("Erreur lors de la suppression de l'utilisateur :", error);
		return reply.status(404).send({message: "User not found"});
	}
}
