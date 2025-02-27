export const addUserDatabaseSchema = {
    body: {
        type: 'object',
        properties: {
            name: { type: 'string' },
            picture: { type: 'string' },
        },
        required: ['name', 'picture'],
    },
};
