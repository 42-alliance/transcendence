
import { FastifySchema } from 'fastify';

export const refreshJWTSchema: FastifySchema = {
  headers: {
    type: 'object',
    properties: {
      Authorization: { type: 'string' }
    },
    required: ['Authorization']
  }
};