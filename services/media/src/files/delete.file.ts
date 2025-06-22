import fs from "fs/promises";
import { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import path from "path";
import { publicPath } from "../index.js";
import { Type } from "@sinclair/typebox";

export const deleteFilesCDNSchema: FastifySchema = {
	params: Type.Object({
		filename: Type.String(),
	})
};

export async function deleteFileCDN(request: FastifyRequest<{Params: { filename: string }}>, reply: FastifyReply) {
	const { filename } = request.params;
	const filepath = path.join(publicPath, filename);
	
	try {
		// Vérifier si le fichier existe
		await fs.access(filepath);
		
		// Supprimer le fichier
		await fs.unlink(filepath);
		
		return reply.code(200).send({ message: `Fichier ${filename} supprimé avec succès` });
	} catch (err) {
		console.error(`Erreur lors de la suppression du fichier ${filename}:`, err);
		return reply.code(404).send({ error: `Fichier ${filename} non trouvé` });
	}
}
