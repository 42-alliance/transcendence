import { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import { publicPath } from "../index.js";
import { pipeline } from "stream/promises";
import path from "path";
import { createWriteStream } from "fs";
import { config } from "../config.js";

export function generateRandomString(length: number) {
	let result = "";
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

export async function uploadFileCDN(request: FastifyRequest, reply: FastifyReply) {
	let filename;

	try {
		// Récupération du fichier depuis la requête multipart
		const parts = request.parts();
		
		let fileUploaded = false;

		// Traitement de chaque partie de la requête multipart
		for await (const part of parts) {
			if (part.type === 'file') {
				// Vérifier qu'on n'a pas déjà traité un fichier
				if (fileUploaded) {
					return reply.code(400).send({ error: "Un seul fichier par requête est autorisé" });
				}
				filename = generateRandomString(15) + part.filename;
				
				const filepath = path.join(publicPath, filename);
				
				// Écrire le fichier sur le disque

				console.log(part.file)
				await pipeline(part.file, createWriteStream(filepath));
				fileUploaded = true;
				
				// Optionnel: stocker des métadonnées sur le fichier
				console.log(`Fichier uploadé: ${filename}, mimetype: ${part.mimetype}`);
			} else {
				return reply.code(400).send({ error: "Il faut envoyer un fichier" });
				
			}
		}
		
		if (!fileUploaded) {
			return reply.code(400).send({ error: "Aucun fichier n'a été envoyé" });
		}
		
		return reply.code(201).send({ 
			message: "Fichier uploadé avec succès",
			filename: filename,
			url: `http://${config.gateway.host}:${config.gateway.port}/media/files/${filename}`
		});
	} catch (err) {
		console.error("Erreur lors de l'upload du fichier:", err);
		return reply.code(500).send({ error: "Erreur lors de l'upload du fichier" });
	}
}
