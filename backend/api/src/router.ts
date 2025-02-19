import { server } from "./index.js"
import { oui } from "./oui/route.js";
// import middie from "@fastify/middie";

// await server.register(middie)
// server.use(require('cors')())
// server.use(require('dns-prefetch-control')())
// server.use(require('frameguard')())
// server.use(require('hsts')())
// server.use(require('ienoopen')())
// server.use(require('x-xss-protection')())

export async function setUpRoutes() {
    server.get('/oui', async function handler(request, reply) {
        console.log('oui');
        return oui();
    })
    server.get('/ping', async (request, reply) => {
      return 'pong\n';
    })
}
