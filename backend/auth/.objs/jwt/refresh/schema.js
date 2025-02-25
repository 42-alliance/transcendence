export const refreshJWTSchema = {
    headers: {
        type: 'object',
        properties: {
            Authorization: { type: 'string' }
        },
        required: ['Authorization']
    }
};
//# sourceMappingURL=schema.js.map