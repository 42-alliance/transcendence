import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

async function getUserById(server: FastifyInstance, id: number) {
	try {
	  const query = "SELECT * FROM users WHERE id = ?";
	  const user = await server.db.get(query, [id]);
  
	  if (!user) {
		throw new Error("User not found");
	  }
  
	  return user;
	} catch (error) {
	  console.error("❌ [getUserById]", error);
	  throw error;
	}
  }
  
  export async function verifyJWT(server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
	const { token } = request.query as { token: string };
  
	// Validate the token input
	if (!token || typeof token !== "string") {
	  console.error("❌ Token manquant ou invalide");
	  return reply.status(400).send({ error: "Token manquant ou invalide" });
	}
  
	try {
	  // Verify the token
	  const decoded = server.jwt.verify(token) as { id: number };
  
	  if (!decoded || !decoded.id) {
		return reply.status(401).send({ error: "Token invalide" });
	  }
  
	  // Fetch the user from the database
	  const user = await getUserById(server, decoded.id);
  
	  // Remove sensitive data before sending the response
	  const { password, ...safeUser } = user;
  
	  // Return the user data
	  return reply.send({ user: safeUser });
	} catch (error: any) {
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