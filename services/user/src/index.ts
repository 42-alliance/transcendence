import fastify from 'fastify';
import { setupRoutes } from './router.js';
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { makeExecutableSchema } from '@graphql-tools/schema';
import mercurius from 'mercurius';


export const prisma = new PrismaClient(); // client prisma


export const server = fastify({
    logger: {
        transport: {
            target: "pino-pretty",
            options: { colorize: true },
        },
    },
});

const schemaContent = readFileSync('./src/graphql/schema.gql', 'utf-8'); // charger le schema

// ajouter les resolvers
const schema = makeExecutableSchema({
    typeDefs: schemaContent,
    resolvers: {
        Mutation: {
			createOrUpdateUser: async (_: unknown, { name, picture }: CreateUserArgs) => {
				try {
					return await prisma.users.upsert({
						where: { name },
						update: { name, picture },
						create: { name, picture },
					});
				} catch (error: any) {
					throw new Error(`Erreur lors de la création/mise à jour de l'utilisateur: ${error.message}`);
				}
			}
			
        }
    }
});

interface CreateUserArgs {
    name: string,
    picture: string,
}

server.register(mercurius, {
    schema,
    graphiql: true,
})

await setupRoutes(server);

const port =  parseInt(process.env.USER_PORT!);

server.listen({ port: port, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        console.error(err);
		process.exit(1);
	}
    console.log(`Server listening at ${address}`);
});