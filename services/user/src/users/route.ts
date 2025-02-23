import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

/**
 * Route POST `/users` - Ajoute un nouvel utilisateur à la base de données.
 *
 * @param {import("fastify").FastifyRequest} request - Requête HTTP avec les données de l'utilisateur.
 * @param {import("fastify").FastifyReply} reply - Réponse HTTP.
 * @returns {Promise<object>} L'utilisateur ajouté.
 */

interface userBody {
    name: string;
    picture: string;
}

export async function addUserDatabase(server: FastifyInstance, request: FastifyRequest, reply: FastifyReply): Promise<object> {
    const body: userBody = request.body as userBody;

    try {
        const result = await server.db.run(
            "INSERT INTO users (name, picture) VALUES (?, ?)",
            [body.name, body.picture]
        );

        return { id: result.lastID };
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
		const users = await server.db.all('SELECT * FROM users');
		return users;
	} catch (error) {
		console.error("Erreur lors de la recuperation des utilisateurs :", error);
		return reply.status(500).send({ error: "Erreur serveur" });
	}
}

/**
 * Route DELETE `/users` - Supprime un utilisateur de la base de données.
 *
 * @param {FastifyInstance} server - Instance du serveur Fastify.
 * @param {import("fastify").FastifyRequest} request - Requête HTTP.
 * @param {import("fastify").FastifyReply} reply - Réponse HTTP.
 * @returns {Promise<object>} Liste des utilisateurs.
 */
export async function deleteUserDatabase(server: FastifyInstance, request: FastifyRequest, reply: FastifyReply): Promise<object> {
	try {
		const userId = Number(request.headers["x-user-id"]); // Get userId from header

		if (!userId) {
			return reply.status(401).send({ error: "Unauthorized. No user ID found." });
		}

		await server.db.run(
			'DELETE FROM users WHERE id = ?',
			[userId]
		);

		return { message: "User successfully deleted" };
	} catch (error) {
		console.error("Erreur lors de la suppression de l'utilisateur :", error);
		return reply.status(500).send({ error: "Erreur serveur" });
	}
}
