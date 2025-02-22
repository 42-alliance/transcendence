export const addUserDatabaseSchema = {
    body: {
        type: 'object',
  		properties: {
			username: { type: 'string' },
			intra_picture: { type: 'string' },
			upload_picrure: { type: 'string' },
  		},
 	 	required: ['username', 'intra_picture'],
    },
};