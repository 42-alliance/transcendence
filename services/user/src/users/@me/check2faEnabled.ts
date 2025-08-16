import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../../index.js";
import { verifyToken } from "../../verify.js";

//check in the prisma users if 2fa is true
export async function check2faEnabled(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<boolean> {
  // Verify the token and get the user ID
  const userId = await verifyToken(request);
  if (!userId) {
    throw new Error("User ID is required to check 2FA status.");
  }
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { twoFactorEnabled: true },
  });
  return user?.twoFactorEnabled ?? false;
}
