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
  TwofaEnabled?: boolean;
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

    const blob = new Blob([new Uint8Array(buffer)], { type: part.mimetype });
    const formData = new FormData();
    const headers = new Headers();
    formData.append("file", blob, part.filename);

    const response = await fetch(
      `https://${config.media.host}:${config.media.port}/files`,
      {
        method: "POST",
        headers: headers,
        body: formData as any,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Erreur lors de l'upload du fichier : ${await response.text()}`
      );
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Erreur upload:", error);
  }
}

export async function updateUserInfos(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = extractUserId(request);

  const parts = request.parts();

  const user = await prisma.users.findUniqueOrThrow({
    where: { id: userId },
  });
  let updateUser: userBody = {};

  try {
    for await (const part of parts) {
      if (part.type === "file") {
        if (part.fieldname === "picture") {
          await deleteMediaFile(user.picture);
          updateUser.picture = await saveFile(part);
        } else if (part.fieldname === "banner") {
          if (user.banner) await deleteMediaFile(user.banner);
          updateUser.banner = await saveFile(part);
        }
      } else if (part.type === "field") {
        if (part.fieldname in updateUser) {
          const key = part.fieldname as keyof userBody;
          if (key === "TwofaEnabled") {
            updateUser[key] = part.value === "true";
          } else {
            updateUser[key] = part.value as string;
          }
        }
      }
    }

    console.log("DEBUG UPDATE USER => ", updateUser);

    if (updateUser.name && updateUser.name.trim().length < 3) {
      return reply.status(400).send({ message: "Nom invalide, trop court." });
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: updateUser,
    });

    return reply.status(200).send({
      message: "Utilisateur mis à jour avec succès",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour :", error);
    return reply.status(500).send({ message: "Erreur interne du serveur." });
  }
}

export async function UpdateTwoFa(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = extractUserId(request);
  const body = request.body as { enabled?: boolean };

  if (!body || typeof body.enabled !== "boolean") {
    reply.status(400).send({
      error:
        "Invalid request body , mais juste avant de d'essayer de le mettre dans prisma",
    });
    return;
  }

  const { enabled } = body;

  try {
    if (enabled) {
      // Vérifier que le secret existe avant d'activer le 2FA
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { twoFactorSecret: true }
      });

      if (!user?.twoFactorSecret) {
        reply.status(400).send({
          error: "2FA setup not completed. Please setup 2FA first."
        });
        return;
      }

      // Si le secret existe, on peut activer le 2FA
      await prisma.users.update({
        where: { id: userId },
        data: {
          twoFactorEnabled: true,
          twoFactorSetupCompleted: true
        },
      });
    } else {
      // Désactivation du 2FA
      await prisma.users.update({
        where: { id: userId },
        data: {
          twoFactorEnabled: false,
          twoFactorSetupCompleted: false,
          twoFactorSecret: null,
          twoFactorBackupCodes: null
        },
      });
    }
    console.log(
      "status de l'user maintenant",
      await prisma.users.findUnique({
        where: { id: userId },
      })
    );
    return reply.status(200).send({
      message: "Two-factor authentication mis à jour avec succès",
    });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour de la vérification en deux étapes :",
      error
    );
    return reply.status(500).send({ message: "Erreur interne du serveur." });
  }
}

export async function updateLastSeen(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = extractUserId(request);

  try {
    await prisma.users.update({
      where: { id: userId },
      data: { lastSeen: new Date() },
    });

    return reply
      .status(200)
      .send({ message: "Dernière connexion mise à jour avec succès." });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour de la dernière connexion :",
      error
    );
    return reply.status(500).send({ message: "Erreur interne du serveur." });
  }
}
