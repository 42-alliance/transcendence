import { Type } from '@sinclair/typebox';
import { FastifySchema } from 'fastify';

export const addUserDatabaseSchema: FastifySchema = {
	body: Type.Object({
		name: Type.String({maxLength: 100, pattern: "^[a-zA-Z0-9_]+$"}),
		email: Type.String(),
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


export const updatedUserInfosSchema: FastifySchema = {
	headers: Type.Object({
		"x-user-id": Type.String({ pattern: "^[0-9]+$" }),
	}),
	body: Type.Object({
		name: Type.Optional(Type.String({ maxLength: 100, pattern: "^[a-zA-Z0-9_]+$" })),
		picture: Type.Optional(Type.String({ maxLength: 100, pattern: "^[a-zA-Z0-9_]+$" })),
		banner: Type.Optional(Type.String({ maxLength: 100, pattern: "^[a-zA-Z0-9_]+$" })),
		bio: Type.Optional(Type.String({ maxLength: 500, pattern: "^[a-zA-Z0-9_]+$" })),
	})
};