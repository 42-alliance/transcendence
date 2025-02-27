
export const config = {
	gateway: {	
		port: parseInt(process.env.GATEWAY_PORT!),
	},
	auth: {
		host: process.env.AUTH_HOST!,
		port: parseInt(process.env.AUTH_PORT!),
	},
	users: {	
		host: process.env.USER_HOST!,	
		port: parseInt(process.env.USER_PORT!),
	},
	jwt: {
		secret: process.env.JWT_SECRET!,
	},
	chat: {
		host: process.env.CHAT_HOST!,
		port: parseInt(process.env.CHAT_PORT!),
	}
};