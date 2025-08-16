import { FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";

export async function verifyToken(request: FastifyRequest): Promise<number> {
  try {
    // 1. Récupérer le token du header Authorization
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("No bearer token provided");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new Error("No token provided");
    }

    // 2. Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: number };
    if (!decoded || !decoded.id) {
      throw new Error("Invalid token");
    }

    return decoded.id;
  } catch (error) {
    throw new Error("Authentication failed: " + error.message);
  }
}
