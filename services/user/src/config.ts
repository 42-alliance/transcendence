const getEnv = (key: string, fallback?: string): string => {
	const value = process.env[key] || fallback;
	if (!value) {
		throw new Error(`Missing environment variable: ${key}`);
	}
	return value;
};

export const config = {
	gateway: {
		port: parseInt(getEnv("GATEWAY_PORT")),
		host: getEnv("GATEWAY_HOST"),
	},
	auth: {
		host: getEnv("AUTH_HOST"),
		port: parseInt(getEnv("AUTH_PORT")),
	},
	users: {
		host: getEnv("USER_HOST"),
		port: parseInt(getEnv("USER_PORT")),
	},
	jwt: {
		secret: getEnv("JWT_SECRET"),
	},
	chat: {
		host: getEnv("CHAT_HOST"),
		port: parseInt(getEnv("CHAT_PORT")),
	},
	media: {
		host: getEnv("MEDIA_HOST"),
		port: parseInt(getEnv("MEDIA_PORT")),
		upload_folder: getEnv("UPLOAD_FOLDER"),
	},
	frontend: {
		host: getEnv("FRONTEND_HOST"),
		port: parseInt(getEnv("FRONTEND_PORT")),
	},
	api: {
		path: "",
	},
	name_pattern: getEnv("NAME_PATTERN"),
};

config.api.path = `https://${config.gateway.host}:${config.gateway.port}`;
