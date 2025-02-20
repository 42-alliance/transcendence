import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

    /**
     * Route POST `/users` - Ajoute un nouvel utilisateur à la base de données.
     *
     * @param {import("fastify").FastifyRequest} request - Requête HTTP avec les données de l'utilisateur.
     * @param {import("fastify").FastifyReply} reply - Réponse HTTP.
     * @returns {Promise<object>} L'utilisateur ajouté.
     */
export async function addUserDatabase(server: FastifyInstance, request: FastifyRequest, reply: FastifyReply): Promise<object> {
	const { username, intra_picture } = request.body as { username: string, intra_picture: string };
	
	try {
		const result = await server.db.run(
			'INSERT INTO users (username, intra_picture) VALUES (?, ?)',
			[username, intra_picture]
		);

		return { id: result.lastID };
	} catch (error) {
		console.error("Erreur lors de l'insertion de l'utilisateur :", error);
		return reply.status(500).send({ error: "Erreur serveur" });
	}
}


    /**
     * Route GET `/users` - Récupère tous les utilisateurs de la base de données.
     *
     * @param {import("fastify").FastifyRequest} request - Requête HTTP.
     * @param {import("fastify").FastifyReply} reply - Réponse HTTP.
     * @returns {Promise<object[]>} Liste des utilisateurs.
     */
export async function getAllUsers(server: FastifyInstance): Promise<object[]> {
	const items = await server.db.all('SELECT * FROM users');
	return items;
}