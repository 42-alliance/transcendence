import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../index.js";
import { extractUserId } from "../utils.js";
