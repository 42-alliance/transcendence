export async function addFriend(server, request, reply) {
    const { id, friendId, friendName } = request.body;
    request.params;
    try {
        // Ajout de la relation d'amitié avec un statut 'pending'
        await server.db.run("INSERT INTO friends (user_id1, user_id2, status) VALUES (?, ?, 'pending');", [id, friendId]);
        console.log(`Demande d'ami envoyée de ${id} à ${friendName}.`);
        // Retour avec statut 201 pour la création
        return reply.status(201).send({ message: `Friend request sent to ${friendName}` });
    }
    catch (error) {
        console.error("Error server:" + error);
        return reply.status(500).send({ error: "Erreur serveur." });
    }
}
export async function updateFriendStatus(server, request, reply) {
    // Récupération du friendId depuis l'URL
    const { friendId } = request.params;
    const { id, status } = request.body;
    const query = `
        UPDATE friends
        SET status = ?
        WHERE (user_id1 = ? AND user_id2 = ?)
           OR (user_id1 = ? AND user_id2 = ?);
    `;
    try {
        // Utilisation de friendId au lieu de friend_id
        await server.db.run(query, [status, id, parseInt(friendId), parseInt(friendId), id]);
        console.log(`Demande d'ami entre ${id} et ${friendId} est maintenant ${status}.`);
        return reply.status(200).send({ message: `Friend request is now ${status}` });
    }
    catch (error) {
        console.error("Error server:" + error);
        return reply.status(500).send({ error: "Erreur serveur." });
    }
}
export async function removeFriend(server, request, reply) {
    const { friendId } = request.params;
    const { id, friend_name } = request.body;
    console.error("friendId: ", request.query);
    // Supprimer la relation d'amitié entre userId1 et userId2
    const query = `
        DELETE FROM friends
        WHERE (user_id1 = ? AND user_id2 = ?)
           OR (user_id1 = ? AND user_id2 = ?);
    `;
    try {
        await server.db.run(query, [id, friendId, friendId, id]);
        console.log(`Relation d'amitié supprimée entre ${id} et ${friend_name}.`);
        return { message: `Friend deleted succesfully` };
    }
    catch (error) {
        console.error("Error server:" + error);
        return reply.status(500).send({ error: "Erreur serveur." });
    }
}
export async function areFriends(server, request, reply) {
    const { id, friend_id } = request.body;
    try {
        const query = `
			SELECT * FROM friends
			WHERE (user_id1 = ? AND user_id2 = ? OR user_id1 = ? AND user_id2 = ?) 
			AND status = 'accepted';
		`;
        const friend = await server.db.get(query, [id, friend_id, friend_id, id]);
        console.error("friend or not: ", friend);
        // return !!friend;  // Retourne true si amis, false sinon
        return true;
    }
    catch (error) {
        console.error("Error server:" + error);
        return reply.status(500).send({ error: "Erreur serveur." });
    }
}
export async function getFriends(server, request, reply) {
    const { id } = request.body;
    const query = `
		SELECT u.id, u.name, u.picture
		FROM friends f
		JOIN users u ON (f.user_id1 = u.id OR f.user_id2 = u.id)
		WHERE (f.user_id1 = ? OR f.user_id2 = ?) AND f.status = 'accepted'
		AND u.id != ?;
	`;
    try {
        const friends = await server.db.all(query, [id, id, id]);
        // Si pas d'amis trouvés, retourne un tableau vide
        return reply.status(200).send(friends);
    }
    catch (error) {
        console.error("Error server:" + error);
        return reply.status(500).send({ error: "Erreur serveur." });
    }
}
export async function getPendingFriendRequest(server, request, reply) {
    const userId = parseInt(request.params.userId);
    console.log("Getting pending requests for user:", userId);
    const query = `
        SELECT u.id, u.name, u.picture
        FROM friends f
        JOIN users u ON (f.user_id1 = u.id OR f.user_id2 = u.id)
        WHERE (f.user_id1 = ? OR f.user_id2 = ?) AND f.status = 'pending'
        AND u.id != ?;
    `;
    try {
        const friends = await server.db.all(query, [userId, userId, userId]);
        return reply.status(200).send(friends);
    }
    catch (error) {
        console.error("Error server:", error);
        return reply.status(500).send({ error: "Erreur serveur." });
    }
}
