import { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import { publicPath, server } from "../index.js";
import { Type } from "@sinclair/typebox";
import path from "path";
import fs from "fs/promises";
import { createReadStream } from "fs";

export const getFilesCDNSchema: FastifySchema = {
	params: Type.Object({
		filename: Type.String(),
	})
};

export async function getFilesCDN(request: FastifyRequest<{Params: { filename: string }}>, reply: FastifyReply) {
	const { filename } = request.params;
	const filepath = path.join(publicPath, filename);
	
	try {
	  // Vérifier si le fichier existe
	  await fs.access(filepath);
	  
	  // Récupérer les informations du fichier
	  const stats = await fs.stat(filepath);
	  
	  // Envoyer le fichier
	  return reply
	  	.header('Content-Disposition', `inline; filename="${filename}"`)
		.type(path.extname(filename))
		.send(createReadStream(filepath));
	} catch (err) {
	  console.error(`Erreur lors de la récupération du fichier ${filename}:`, err);
	  return reply.code(404).send({ error: `Fichier ${filename} non trouvé` });
	}
}
