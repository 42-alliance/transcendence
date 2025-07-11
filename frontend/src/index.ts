import Fastify, { FastifyInstance } from "fastify";
import path from "path";
import fastifyStatic from "@fastify/static";
import fs from "fs"; // Pour vérifier si un fichier existe

export const server: FastifyInstance = Fastify({
    logger: {
        transport: {
            target: "pino-pretty",
            options: { colorize: true },
        },
    },
});

// 📌 Définis le dossier où sont tes fichiers
const publicPath = path.resolve("./");


// 🔹 Servir les fichiers statiques
server.register(fastifyStatic, {
    root: publicPath,
    index: ["index.html"], // Servir index.html par défaut
});

// 🔥 Fallback : Si un fichier n'existe pas, retourner index.html
server.setNotFoundHandler((request, reply) => {
    const filePath = path.join(publicPath, request.url);

    // Vérifier si le fichier demandé existe
    if (fs.existsSync(filePath)) {
        return reply.sendFile(request.url);
    } else {
        return reply.sendFile("index.html");
    }
});

const PORT = 80;

server.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`🚀 Server listening at ${address}`);
});
