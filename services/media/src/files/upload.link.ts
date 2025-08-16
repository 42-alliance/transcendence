import { Type } from "@sinclair/typebox";
import { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import { generateRandomString } from "./upload.file.js";
import path from "path";
import { publicPath } from "../index.js";
import { createWriteStream } from "fs";
import { pipeline } from "stream";
import { promisify } from "util";
import { config } from "../config.js";

export const uploadFileLinkSchema: FastifySchema = {
	body: Type.Object({
		file_url: Type.String(),
	})
};

const streamPipeline = promisify(pipeline);

export async function uploadFileLink(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { file_url } = request.body as { file_url: string };

		const header = new Headers();
		const response = await fetch(file_url, {
			method: "GET",
			headers: header,
		});

		if (!response.ok) {
			throw new Error("Failed to fetch the file URL");
		}

		if (!response.body) {
			throw new Error("No content in the response body");
		}

		const filename = generateRandomString(30) + ".jpg";
		const filepath = path.join(publicPath, filename);

		// Pipe the fetch response directly into the write stream
		await streamPipeline(response.body, createWriteStream(filepath));

		return reply.status(201).send({
			message: "Fichier uploadé avec succès",
			filename: filename,
			url: `https://${config.gateway.host}:${config.gateway.port}/media/files/${filename}`
		});
	} catch (error) {
		console.error("Error uploadFileLink: ", error);
		return reply.status(500).send({ error: `Error: ${error}` });
	}
}
