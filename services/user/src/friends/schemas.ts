import fastify, { FastifySchema } from "fastify";
import { Type } from '@sinclair/typebox'


export const addFriendSchema: FastifySchema = {
	headers: Type.Object({
		"x-user-id": Type.String({ pattern: "^[0-9]+$" }),
	}),
	body: Type.Object({
		friendName: Type.String(),
	}),
}

export const removeFriendSchema: FastifySchema = {
	headers: Type.Object({
		"x-user-id": Type.String({ pattern: "^[0-9]+$" }),
	}),
	params: Type.Object({
		friendId: Type.String({ pattern: "^[0-9]+$" }),
	})
};

export const getFriendsSchema: FastifySchema = {
	headers: Type.Object({
		"x-user-id": Type.String({ pattern: "^[0-9]+$" }),
	}),
};

export const getFriendStatusSchema = {
	headers: Type.Object({
		"x-user-id": Type.String({ pattern: "^[0-9]+$" }),
	}),
	params: Type.Object({
		friendId: Type.String({ pattern: "^[0-9]+$" }),
	})
};

export const pendingRequestsSchema = {
	headers: Type.Object({
		"x-user-id": Type.String({ pattern: "^[0-9]+$" }),
	}),
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

export const getPendingFriendRequestSchema: FastifySchema = {
	headers: Type.Object({
		"x-user-id": Type.String({ pattern: "^[0-9]+$" }),
	}),
};