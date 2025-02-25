import Fastify from "fastify";
import { config } from "./config.js";
import jwt from "@fastify/jwt";
import  mercuriusGateway from '@mercuriusjs/gateway';
import { verifyJWT } from "./verify.js";

export const gateway = Fastify({
    logger: {
        level: 'debug',
        transport: {
            target: "pino-pretty",
            options: { colorize: true },
        },
    },
});

gateway.register(jwt, {
	secret: config.jwt.secret,
});

gateway.addHook('onRequest', async (req, res) => {
    try {
        verifyJWT(req, res);
    } catch (err) {
        res.status(401).send({ error: 'Unauthorized' });
    }
});

gateway.register(mercuriusGateway, {
	gateway: {
		services: [
			{
				name: `${config.users.host}`,
				url: `http://${config.users.host}:${config.users.port}/graphql`
			},
			{
				name: `${config.auth.host}`,
				url: `http://${config.auth.host}:${config.auth.port}/graphql`
			}
		]
	}
})

gateway.listen({ port: config.gateway.port, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`🚀 API GATEWAY listening at ${address}/graphql`);
});
