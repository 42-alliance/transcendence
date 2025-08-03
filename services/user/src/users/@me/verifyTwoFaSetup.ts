import { FastifyRequest, FastifyReply, FastifySchema } from "fastify";
import { authenticator } from "otplib";
import { prisma } from "../../index.js";
import { extractUserId } from "../../utils.js";
import { Type } from "@sinclair/typebox";

export const verify_2fa_code_setupSchema: FastifySchema = {
	headers: Type.Object({
		"x-user-id": Type.String({ pattern: "^[0-9]+$" }),
	}),
	body: Type.Object({
		code: Type.String({pattern: "^[0-9]{6}$"})
	}),
};

export async function verify_2fa_code_setup(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // 1. Vérifier le token JWT et obtenir l'utilisateur
    const userId = extractUserId(request);
    const user = await prisma.users.findUnique({
      where: { id: userId },
	  select: {
		twoFactorSecret: true
	  }
    });

    if (!user) {
      reply.status(404).send({ error: "User not found" });
      return;
    }

    if (!user.twoFactorSecret) {
      reply.status(400).send({ error: "2FA setup not initiated" });
      return;
    }

	const { code } = request.body as {
		code: string
	};

    // 2. Vérifier le code TOTP
    const isValid = authenticator.verify({
      token: code,
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
