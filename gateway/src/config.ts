const getEnv = (key: string, fallback?: string): string => {
	const value = process.env[key] || fallback;
	if (!value) {
		throw new Error(`Missing environment variable: ${key}`);
	}
	return value;
};

export const config = {
	gateway: {
		port: parseInt(getEnv('GATEWAY_PORT')),
		ssl: {
			key: getEnv('GATEWAY_SSL_KEY'),
			cert: getEnv('GATEWAY_SSL_CERT'),
		}
	},
	auth: {
		host: getEnv('AUTH_HOST'),
		port: parseInt(getEnv('AUTH_PORT')),
	},
	users: {
		host: getEnv('USER_HOST'),
		port: parseInt(getEnv('USER_PORT')),
	},
	jwt: {
		secret: getEnv('JWT_SECRET'),
	},
	chat: {
		host: getEnv('CHAT_HOST'),
		port: parseInt(getEnv('CHAT_PORT')),
	},
	media: {
		host: getEnv('MEDIA_HOST'),
		port: parseInt(getEnv('MEDIA_PORT')),
		upload_folder: getEnv('UPLOAD_FOLDER'),
	},
	frontend: {
		host: getEnv('FRONTEND_HOST'),
		port: parseInt(getEnv('FRONTEND_PORT')),
	},
	game: {
		host: getEnv('GAME_HOST'),
		port: parseInt(getEnv('GAME_PORT')),
		ws_port: parseInt(getEnv('GAME_WS_PORT')),
	},
};
