import { FastifyRequest, FastifyReply, FastifySchema } from "fastify";
import { prisma } from "../../index.js";
import { authenticator } from "otplib";
import { extractUserId } from "../../utils.js";
import { Type } from "@sinclair/typebox";

export const verify_2fa_codeSchema: FastifySchema = {
	headers: Type.Object({
		"x-user-id": Type.String({ pattern: "^[0-9]+$" }),
	}),
	body: Type.Object({
		code: Type.String({pattern: "^[0-9]{6}$"})
	}),
}

export async function verify_2fa_code(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const userId = extractUserId(request);

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        twoFactorSecret: true,
        twoFactorSetupCompleted: true,
        twoFactorEnabled: true,
      },
    });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      reply.status(400).send({ error: "2FA is not enabled for this user" });
      return;
    }

    const { code } = request.body as {
		code: string
	};

    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      reply
        .status(401)
        .send({ error: "Invalid 2FA code, le code n'est pas bon chackal !!!" });
      return;
    }

	if (user.twoFactorSetupCompleted === false) {
		await prisma.users.update({
			where: { id: userId },
			data: {
				twoFactorSetupCompleted: true,
				twoFactorEnabled: true,
			},
		});
	}

    console.log("2FA code verified successfully for user:", userId);
    reply.send({ success: true }).status(200);
  } catch (error) {
    console.error("Error verifying 2FA login:", error);
    reply.status(500).send({ error: "Internal server error" });
  }
}
