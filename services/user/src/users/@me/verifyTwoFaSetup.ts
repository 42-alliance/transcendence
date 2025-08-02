import { FastifyRequest, FastifyReply } from "fastify";
import { authenticator } from "otplib";
import { prisma } from "../../index.js";
import { verifyToken } from "../../verify.js";

// Définition du type pour le body de la requête
interface IVerifyTwoFaBody {
  code: string;
}

export async function verifyTwoFaSetup(
  request: FastifyRequest<{
    Body: IVerifyTwoFaBody;
  }>,
  reply: FastifyReply
): Promise<void> {
  try {
    // 1. Vérifier le token JWT et obtenir l'utilisateur
    const userId = await verifyToken(request);
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      reply.status(404).send({ error: "User not found" });
      return;
    }

    if (!user.twoFactorSecret) {
      reply.status(400).send({ error: "2FA setup not initiated" });
      return;
    }

    // 2. Vérifier le code TOTP
    const isValid = authenticator.verify({
      token: request.body.code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      reply.status(400).send({ error: "Invalid verification code" });
      return;
    }

    // 3. Si le code est valide, marquer le setup comme complété
    await prisma.users.update({
      where: { id: userId },
      data: {
        twoFactorSetupCompleted: true,
        twoFactorEnabled: true,
      },
    });

    // 4. Envoyer la réponse de succès
    reply.send({ success: true });
  } catch (error) {
    console.error("Error in verifyTwoFaSetup:", error);
    reply.status(500).send({ error: "Internal server error" });
  }
}
