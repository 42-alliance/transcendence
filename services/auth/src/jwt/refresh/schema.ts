
import { Type } from '@sinclair/typebox';
import { FastifySchema } from 'fastify';

export const refreshJWTSchema: FastifySchema = {
	body: Type.Object({
		token: Type.String(),
	})
};

export const deleteUserSchema: FastifySchema = {
	headers: Type.Object({
		"x-user-id": Type.String({ pattern: "^[0-9]+$" }),
	})
}
