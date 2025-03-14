import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

export async function verifyJWT(server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
	try {
		await request.jwtVerify(); // Verifies token & stores it in `request.user`

		const decoded = request.user as { id: number, type: string }; // Extract user info
		if (!decoded || !decoded.id) {
			throw new Error("Invalid JWT payload");
		}

		if (decoded.type !== "access_token") {
			throw new Error("Invalid token type");
		}

		console.log("✅ [JWT] decode:", decoded);

    request.headers['x-user-id'] = String(decoded.id); // Attach `userId` to headers
	console.log("request.headers gateway: ", request.headers);
		return request.headers['x-user-id'];
	} catch (error: any) {
		console.error("❌ [JWT Error]", error);
		return reply.status(error.statusCode || 401).send({ error: "Unauthorized" });
	}
}

export async function verifyJWT_WebSocket(server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
	try {
		// ✅ Récupérer le token depuis `Sec-WebSocket-Protocol`
		const protocolHeader = request.headers["sec-websocket-protocol"];
		if (!protocolHeader) {
			throw new Error("Missing WebSocket protocol header");
		}

		const token = protocolHeader.split(", ")[1]; // ✅ Récupère le token
		if (!token) {
			throw new Error("Missing token");
		}

		// ✅ Vérifier le JWT
		const decoded = server.jwt.verify<{ id: number; type: string }>(token);
		if (!decoded || !decoded.id) {
			throw new Error("Invalid JWT payload");
		}

		if (decoded.type !== "access_token") {
			throw new Error("Invalid token type");
		}

		console.log("✅ WebSocket JWT validé:", decoded);

		// ✅ Ajouter `x-user-id` pour le proxy
		request.headers["x-user-id"] = String(decoded.id);
	} catch (error) {
		console.error("❌ Erreur WebSocket Auth:", error);
		return reply.status(401).send({ error: "Unauthorized WebSocket connection" });
	}
}