import { Type } from '@sinclair/typebox';

export const addUserDatabaseSchema = {
  body: Type.Object({
    name: Type.String(),
    picture: Type.String(),
  }),
};


export const deleteUserDatabaseSchema = { 
    headers: {
        type: 'object',
        properties: {
            "x-user-id": {type: 'string'}
        },
        required: ['x-user-id'],
    }
};