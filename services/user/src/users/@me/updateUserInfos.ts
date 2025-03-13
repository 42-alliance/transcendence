import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../index.js";
import { extractUserId } from "../../utils.js";
import { pipeline } from "stream";
import util from "util";
import FormData from "form-data";
import { config } from "../../config.js";


const pump = util.promisify(pipeline);

interface userBody {
    name?: string;
    picture?: string;
    banner?: string;
    bio?: string;
}

export async function saveFile(part: any): Promise<string | undefined> {
    const formData = new FormData();
    formData.append("file", part.file, part.filename); // ✅ On envoie directement le stream

    try {
		console.log("url == ", `http://gateway:${config.gateway.port}/media/files`);
        const response = await fetch(`http://gateway:${config.gateway.port}/media/files`, {
            method: "POST",
            body: formData as unknown as BodyInit,
        });

        if (!response.ok) {
            throw new Error(`Erreur lors de l'upload du fichier : ${await response.text()}`);
        }

        const data = await response.json();
        return data.url;
    } catch (error) {
        console.error("Erreur upload:", error);
    }
}

export async function updateUserInfos(request: FastifyRequest, reply: FastifyReply) {
    const userId = extractUserId(request);

    const parts = request.parts();
    let updateUser: userBody = {};

    try {
        for await (const part of parts) {
            if (part.type === "file") {
                if (part.fieldname === "picture") {
                    updateUser.picture = await saveFile(part); // ✅ Upload et récupère l'URL
                } else if (part.fieldname === "banner") {
                    updateUser.banner = await saveFile(part); // ✅ Upload et récupère l'URL
                }
            } else if (part.type === "field") {
                updateUser[part.fieldname as keyof userBody] = part.value as string;
            }
        }

        if (updateUser.name && updateUser.name.trim().length < 3) {
            return reply.status(400).send({ message: "Nom invalide, trop court." });
        }

        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: updateUser,
        });

        return reply.status(200).send({ message: "Utilisateur mis à jour avec succès", user: updatedUser });
    } catch (error: any) {
        console.error("Erreur lors de la mise à jour :", error);
        return reply.status(500).send({ message: "Erreur interne du serveur." });
    }
}

