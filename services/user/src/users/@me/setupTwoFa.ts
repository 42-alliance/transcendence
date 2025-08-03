import { FastifyRequest, FastifyReply, FastifySchema } from "fastify";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import crypto from "crypto";
import { prisma } from "../../index.js";
import { extractUserId } from "../../utils.js";
import { Type } from "@sinclair/typebox";

export const setup2FaSchema: FastifySchema = {
	headers: Type.Object({
		"x-user-id": Type.String({ pattern: "^[0-9]+$" }),
	}),
}

export async function setup2Fa(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // 1. Vérifier le token et obtenir l'utilisateur
	const userId = extractUserId(request);
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      reply.status(404).send({ error: "User not found" });
      return;
    }

    // 2. Générer un secret TOTP unique
    const secret = authenticator.generateSecret();

    // 3. Créer l'URI TOTP pour le QR code
    const otpauth = authenticator.keyuri(
      user.email,
      "Dragon Pong", // Nom de votre application
      secret
    );

    // 4. Générer le QR code
    const qr_code = await QRCode.toDataURL(otpauth);

    // 6. Stocker temporairement le secret et les codes de backup
    await prisma.users.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret,
        twoFactorSetupCompleted: false, // Pas encore validé
      },
    });

    // 7. Envoyer la réponse
    reply.send({ qr_code });
  } catch (error) {
    console.error("Error in setupTwoFa:", error);
    reply.status(500).send({ error: "Internal server error" });
  }
}
