import { FastifyBodyParser, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../index.js";
import { extractUserId } from "../../utils.js";

interface userBody {
    name?: string;
    picture?: string;
	banner?: string;
	bio?: string;
}

export async function updateUserInfos(request:FastifyRequest, reply: FastifyReply) {
    const userId = extractUserId(request);

    const body: userBody = request.body as userBody;

	console.error("request.body: ", request.body);

	console.error("body.name :", body.name);

    if (!body.name || body.name.trim().length < 3) {
        return reply.status(400).send({ message: "Nom invalide, trop court." });
    }


    try {
		console.error("je passe ici dans le back");
        // 🔹 Met à jour uniquement si le champ a changé
        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: { name: body.name },
        });

        return reply.status(200).send({ message: "Utilisateur mis à jour avec succès", user: updatedUser });
    } catch (error: any) {
        if (error.code === "P2002") {
            return reply.status(400).send({ message: "Ce nom est déjà pris." });
        }
        console.error("Erreur lors de la mise à jour :", error);
        return reply.status(500).send({ message: "Erreur interne du serveur." });
    }
}

