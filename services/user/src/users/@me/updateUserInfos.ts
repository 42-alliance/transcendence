import { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import { prisma } from "../../index.js";
import { extractUserId } from "../../utils.js";
import { config } from "../../config.js";
import { MultipartFile } from "@fastify/multipart";
import { deleteMediaFile } from "../delete.user.js";

interface userBody {
    name?: string;
    picture?: string;
    banner?: string;
    bio?: string;
}

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
    });
}

async function saveFile(part: MultipartFile): Promise<string | undefined> {
    try {
        const buffer = await streamToBuffer(part.file);

        if (buffer.length === 0) {
            throw new Error("Le fichier est vide.");
        }

        const blob = new Blob([buffer], { type: part.mimetype });
        const formData = new FormData();
		const headers = new Headers();
        formData.append("file", blob, part.filename);

        const response = await fetch(`http://${config.media.host}:${config.media.port}/files`, {
            method: "POST",
            headers: headers,
            body: formData as any,
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

	const user = await prisma.users.findUniqueOrThrow({
		where: {id: userId}
	});
    let updateUser: userBody = {};

    try {
        for await (const part of parts) {
            if (part.type === "file") {
                if (part.fieldname === "picture") {
					await deleteMediaFile(user.picture);
                    updateUser.picture = await saveFile(part);
                } else if (part.fieldname === "banner") {
					if (user.banner)
						await deleteMediaFile(user.banner);
                    updateUser.banner = await saveFile(part);
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

