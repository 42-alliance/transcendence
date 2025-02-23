async function getUserById(server, id) {
    try {
        const query = "SELECT * FROM users WHERE id = ?";
        const user = await server.db.get(query, [id]);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    catch (error) {
        console.error("❌ [getUserById]", error);
        throw error;
    }
}
export async function verifyJWT(server, request, reply) {
    const { token } = request.query;
    // Validate the token input
    if (!token || typeof token !== "string") {
        console.error("❌ Token manquant ou invalide");
        return reply.status(400).send({ error: "Token manquant ou invalide" });
    }
    try {
        // Verify the token
        const decoded = server.jwt.verify(token);
        if (!decoded || !decoded.id) {
            return reply.status(401).send({ error: "Token invalide" });
        }
        // Fetch the user from the database
        const user = await getUserById(server, decoded.id);
        // Remove sensitive data before sending the response
        const { password, ...safeUser } = user;
        // Return the user data
        return reply.send({ user: safeUser });
    }
    catch (error) {
        console.error("[JWT Error]", error);
        // Handle specific errors
        if (error.message === "User not found") {
            return reply.status(404).send({ error: "Utilisateur non trouvé" });
        }
        if (error.name === "JsonWebTokenError") {
            return reply.status(401).send({ error: "Token invalide" });
        }
        if (error.name === "TokenExpiredError") {
            return reply.status(401).send({ error: "Token expiré" });
        }
        // Generic error response
        return reply.status(500).send({ error: "Une erreur est survenue" });
    }
}
//# sourceMappingURL=route.js.map