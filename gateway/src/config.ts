export const config = {
	gateway: {	// Configuration du service gateway
		port: parseInt(process.env.GATEWAY_PORT!),	// Port d'écoute du service gateway
	},
	auth: {	// Configuration du service AUTH_PORT
		host: process.env.AUTH_HOST!,	// Host du service auth
		port: parseInt(process.env.AUTH_PORT!),	// Port d'écoute du service auth
	},
	users: {	// Configuration du service USERS_PORT
		host: process.env.USER_HOST!,	// Host du service users
		port: parseInt(process.env.USER_PORT!),	// Port d'écoute du service users
	},
	jwt: {	// Configuration du service
		secret: process.env.JWT_SECRET!,	// Secret pour la génération des tokens JWT
	},
	chat: {
		host: process.env.CHAT_HOST!,
		port: parseInt(process.env.CHAT_PORT!),
	},
	media: {
		host: process.env.MEDIA_HOST!,
		port: parseInt(process.env.MEDIA_PORT!),
		upload_folder: parseInt(process.env.UPLOAD_FOLDER!),
	},
	frontend: {
		host: process.env.FRONTEND_HOST!,
		port: parseInt(process.env.FRONTEND_PORT!),
	},
	// COnfig pour le service game
	game: {
		host: process.env.GAME_HOST!,
		port: parseInt(process.env.GAME_PORT!),
		ws_port: parseInt(process.env.GAME_WS_PORT!), // Port pour le websocket
	},

};
