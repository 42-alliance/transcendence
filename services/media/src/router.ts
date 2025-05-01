import fastifyStatic from "@fastify/static";
import fs from "fs/promises";
import { FastifyInstance } from "fastify";
import { getFilesCDN, getFilesCDNSchema } from "./files/get.file.js";
import { publicPath } from "./index.js";
import { deleteFileCDN } from "./files/delete.file.js";
import { uploadFileCDN } from "./files/upload.file.js";
import { uploadFileLink, uploadFileLinkSchema } from "./files/upload.link.js";

export async function setupMediaRoutes(server: FastifyInstance) {
  
	// Créer le dossier s'il n'existe pas
	try {
		await fs.mkdir(publicPath, { recursive: true });
	} catch (err) {
		console.error("Erreur lors de la création du dossier d'upload:", err);
	}

	// Route pour récupérer un fichier spécifique
	server.get<{Params: { filename: string }}>("/files/:filename", { schema: getFilesCDNSchema }, async function handler(request, reply) {
		await getFilesCDN(request, reply);
	});

	// Route pour uploader un fichier
	server.post("/files", async function handler(request, reply) {
		await uploadFileCDN(request, reply);	
	});

	server.post("/files/url", { schema: uploadFileLinkSchema }, async function handler(request, reply) {
		await uploadFileLink(request, reply);	
	});

	// Route pour supprimer un fichier
	server.delete<{Params: { filename: string }}>("/files/:filename", async function handler(request, reply) {
		await deleteFileCDN(request, reply);
	});
}