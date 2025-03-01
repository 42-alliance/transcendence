import fastify, { FastifySchema } from "fastify";
import { Type } from '@sinclair/typebox'


export const addFriendSchema: FastifySchema = {
    headers: {
        type: 'object',
        properties: {
            "x-user-id": {type: 'string'}
        },
        required: ['x-user-id'],
    },
    body: {
        type: 'object',
        properties: {
            friendName: {type: 'string'}
        },
        required: ["friendName"],
    },
}

export const removeFriendSchema: FastifySchema = {
	headers: Type.Object({
		"x-user-id": Type.String(),
	}),
	params: Type.Object({
		friendId: Type.String(),
	})
};

export const areFriendsSchema = {
	params: {
		type: "object",
		properties: {
			friendId: { type: "string", pattern: "^[0-9]+$" }, // Valide que friendId est un nombre
		},
		required: ["friendId"],
	},
};

export const pendingRequestsSchema = {
    params: {
        type: 'object',
        properties: {
            userId: { type: 'number' }
        },
        required: ['userId']
    }
};

export const updateFriendStatusSchema: FastifySchema = {
  params: Type.Object({
    friendId: Type.String({ pattern: "^[0-9]+$" }),
  }),
  headers: Type.Object({
    "x-user-id": Type.String({ pattern: "^[0-9]+$" }),
  }),
  body: Type.Object({
    status: Type.String(),
  }),
};