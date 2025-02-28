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
        type: 'object',
        properties: {
            id: { type: 'number' },
            friendId: { type: 'number' }
        },
        required: ['id', 'friendId']
    }
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