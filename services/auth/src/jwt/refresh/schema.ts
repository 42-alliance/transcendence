
import { FastifySchema } from 'fastify';

export const refreshJWTSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      token: { type: 'string' }
    },
    required: ['token'],
  }
};

