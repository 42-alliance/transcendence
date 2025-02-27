export async function addUserDatabase(server, request, reply) {
    const body = request.body;
    try {
        const result = await server.db.run("INSERT INTO users (name, picture) VALUES (?, ?)", [body.name, body.picture]);
        return { id: result.lastID };
    }
    catch (error) {
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
export async function getAllUsers(server, reply) {
    try {
        const items = await server.db.all('SELECT * FROM users');
        return items;
    }
    catch (error) {
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
export async function deleteUserDatabase(server, request, reply) {
    const { id } = request.body;
    try {
        await server.db.run('DELETE FROM users WHERE id=(?)', [id]);
        return { message: "user sucessfully deleted" };
    }
    catch (error) {
        console.error("Erreur lors de la suppresion de l'utilisateur :", error);
        return reply.status(500).send({ error: "Erreur serveur" });
    }
}
