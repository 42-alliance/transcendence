import { FastifyRequest, FastifyReply } from "fastify";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import crypto from "crypto";
import { prisma } from "../../index.js";
import { verifyToken } from "../../verify.js";

export async function setupTwoFa(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // 1. Vérifier le token et obtenir l'utilisateur
    const userId = await verifyToken(request);
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
    const qrCodeUrl = await QRCode.toDataURL(otpauth);

    // 5. Générer des codes de backup (10 codes de 8 caractères)
    const backupCodes = Array(10)
      .fill(0)
      .map(() => crypto.randomBytes(4).toString("hex"));

    // 6. Stocker temporairement le secret et les codes de backup
    await prisma.users.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret,
        twoFactorBackupCodes: JSON.stringify(backupCodes),
        twoFactorSetupCompleted: false, // Pas encore validé
      },
    });

    // 7. Envoyer la réponse
    reply.send({
      qrCodeUrl,
      secret, // Uniquement pour la vérification initiale
      backupCodes,
    });
  } catch (error) {
    console.error("Error in setupTwoFa:", error);
    reply.status(500).send({ error: "Internal server error" });
  }
}
