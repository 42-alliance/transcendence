
export const config = {
	gateway: {	// Configuration du service gateway
		port: parseInt(process.env.GATEWAY_PORT!),	// Port d'écoute du service gateway
	},
	auth: {	// Configuration du service AUTH_PORT
		port: parseInt(process.env.AUTH_PORT!),	// Port d'écoute du service auth
	},
	users: {	// Configuration du service USERS_PORT
		port: parseInt(process.env.USER_PORT!),	// Port d'écoute du service users
	},
};