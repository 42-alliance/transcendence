import { FastifyRequest, FastifyReply, FastifySchema } from "fastify";
import { prisma } from "../../index.js";
import { verifyToken } from "../../verify.js";
import { authenticator } from "otplib";
import { Type } from "@sinclair/typebox";

export async function verifyTwoFaLogin(
  request: FastifyRequest<{ Body: { code: string } }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const userId = await verifyToken(request);
    if (!userId) {
      reply.status(401).send({ error: "Unauthorized" });
      return;
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        twoFactorSecret: true,
        twoFactorEnabled: true,
      },
    });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      reply.status(400).send({ error: "2FA is not enabled for this user" });
      return;
    }

    const { code } = request.body;
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
    console.log("2FA code verified successfully for user:", userId);



    reply.send({ success: true }).status(200);
  } catch (error) {
    console.error("Error verifying 2FA login:", error);
    reply.status(500).send({ error: "Internal server error" });
  }
}

export const verifyTwoFaLoginnSchema: FastifySchema = {
	body: Type.Object({
		code: Type.String({ pattern: "[0-9]{6}"}),
		id: Type.Number(),
	})
}

interface verifyTwoFaLoginnBody {
	code: string, 
	id: number
}

export async function verifyTwoFaLoginn(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {

	const body = request.body as verifyTwoFaLoginnBody;

    const userId = body.id;

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        twoFactorSecret: true,
        twoFactorEnabled: true,
      },
    });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      reply.status(400).send({ error: "2FA is not enabled for this user" });
      return;
    }

    const code = body.code;
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
    console.log("2FA code verified successfully for user:", userId);

	

    reply.send({ success: true }).status(200);
  } catch (error) {
    console.error("Error verifying 2FA login:", error);
    reply.status(500).send({ error: "Internal server error" });
  }
}