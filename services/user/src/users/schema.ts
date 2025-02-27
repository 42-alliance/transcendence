import { Required, Type } from '@sinclair/typebox';

export const addUserDatabaseSchema = {
  body: Type.Object({
    name: Type.String(),
    picture: Type.String(),
  }, { required: ["name", "picture"]}),
};


export const userIdHeader = {
	headers: Type.Object({
		"x-user-id": Type.String(),
	}, { required: ["x-user-id"] })
};