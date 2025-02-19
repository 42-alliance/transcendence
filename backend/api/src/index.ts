import fastify from 'fastify'
import { setUpRoutes } from './router.js'

export const server = fastify()

server.register(setUpRoutes);

// await setUpRoutes();

server.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})