import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../index.js";
import { extractUserId } from "../utils.js";

interface userBody {
    name: string;
    email: string;
    picture: string;
}

/**
 * Route POST `/users` - Ajoute un nouvel utilisateur à la base de données.
 *
 * @param {import("fastify").FastifyRequest} request - Requête HTTP avec les données de l'utilisateur.
 * @param {import("fastify").FastifyReply} reply - Réponse HTTP.
 * @returns {Promise<object>} L'utilisateur ajouté.
 */
export async function addUserDatabase(server: FastifyInstance, request: FastifyRequest, reply: FastifyReply): Promise<object> {
    const body: userBody = request.body as userBody;

    try {
		const user = await prisma.users.findUnique({
			where: {
			  email: body.email 
			}
		});

		if (user) {
			return reply.status(200).send({ id: user.id });
		}
		
		const result = await prisma.users.create({
			data: {
				name: body.name,
				email: body.email,
				picture: body.picture,
			}
		});
		
		return reply.status(201).send({ id: result.id });
    } catch (error: any) {
        console.error("Erreur lors de l'insertion de l'utilisateur :", error);

        if (error.code === "SQLITE_CONSTRAINT") {
            return reply.status(400).send({ error: `Une erreur s'est produite: ${error}` });
        }

        return reply.status(500).send({ error: "Erreur serveur." });
    }
}

/**
 * Route GET `/users` - Récupère tous les utilisateurs de la base de données.
*
 * @param {FastifyInstance} server - Instance du serveur Fastify.
 * @param {import("fastify").FastifyReply} reply - Réponse HTTP.
* @returns {Promise<object[]>} Liste des utilisateurs.
*/
export async function getAllUsers(server: FastifyInstance, reply: FastifyReply): Promise<object[]> {
	try {
		const users = await prisma.users.findMany({
			select: {
				id: true,
				name: true,
				picture: true,
				banner: true,
				bio: true,
				created_at: true,
			}
		});

		return users;
	} catch (error) {
		console.error("Erreur lors de la recuperation des utilisateurs :", error);
		return reply.status(500).send({ error: "Erreur serveur" });
	}
}

export async function getUserByName(server: FastifyInstance, request: FastifyRequest<{ Params: { name: string } }>, reply: FastifyReply) {
	const { name } = request.params;
  
	try {
		const user = await prisma.users.findUnique({
			where: { name: name },
			select: {
				id: true,
				name: true,
				picture: true,
				banner: true,
				bio: true,
				created_at: true,
			}
		});
  
		if (!user) {
			return reply.status(404).send({ error: "User not found" });
		}
  
	  	return user;
	} catch (error) {
		console.error("Error when trying to search user: ", error);
		return reply.status(500).send({ error: "Internal server error" });
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

		await prisma.users.delete({
			where: { id: userId }
		});

		reply.clearCookie("refresh_token", { path: "/" });
		reply.status(200).send({ message: "User successfully deleted" });
	} catch (error) {
		console.error("Erreur lors de la suppression de l'utilisateur :", error);
		reply.status(500).send({ message: "Internal server error" });
	}
}