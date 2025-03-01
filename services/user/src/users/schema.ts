import { Type } from '@sinclair/typebox';
import { FastifySchema } from 'fastify';

export const addUserDatabaseSchema: FastifySchema = {
	body: Type.Object({
		name: Type.String({maxLength: 100, pattern: "^[a-zA-Z0-9_]+$"}),
		picture: Type.String(),
	}),
};


export const userIdHeader = {
	headers: Type.Object({
		"x-user-id": Type.String({ pattern: "^[0-9]+$" }),
	})
};

export const nameParamsSchema: FastifySchema = {
	headers: Type.Object({
		"x-user-id": Type.String({ pattern: "^[0-9]+$" }),
	}),
	params: Type.Object({
		name: Type.String({maxLength: 100, pattern: "^[a-zA-Z0-9_]+$"}),
	})
};