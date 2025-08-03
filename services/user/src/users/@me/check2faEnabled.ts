import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../../index.js";
import { extractUserId } from "../../utils.js";

//check in the prisma users if 2fa is true
export async function check2faEnabled(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<boolean> {
	const userId = extractUserId(request);
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { twoFactorEnabled: true },
  });
  return user?.twoFactorEnabled;
}
