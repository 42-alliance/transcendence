export const addUserDatabaseSchema = {
    body: {
        type: 'object',
  		properties: {
			id: { type: 'number' },
			name: { type: 'string' },
			picture: { type: 'string' },
  		},
 	 	required: ['id', 'name', 'picture'],
    },
};