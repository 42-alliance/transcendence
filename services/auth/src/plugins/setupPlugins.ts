import { FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import { config } from "../config";

export const setupPlugins = (server: FastifyInstance) => {	
	server.register(cookie, {
		parseOptions: {},
	});

	server.register(jwt, {
		secret: config.jwt.secret,
	});
}