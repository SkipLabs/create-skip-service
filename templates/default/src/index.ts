import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import { server, serviceBroker } from "./skipservice.mjs";

// Initialize Fastify app
const fastify = Fastify();

// Utility function to handle errors
const handleError = (reply: FastifyReply, error: unknown) => {
  console.error("Error: ", error);
  reply.status(500).send(error);
};

// Define routes
fastify.get<{ Params: { uid: string } }>(
  "/active_friends/:uid",
  async (request, reply) => {
    try {
      const uuid = await serviceBroker.getStreamUUID(
        "active_friends",
        Number(request.params.uid),
      );
      reply.redirect(`http://localhost:8080/v1/streams/${uuid}`, 307);
    } catch (error) {
      handleError(reply, error);
    }
  },
);

fastify.put<{ Params: { uid: string }; Body: any }>(
  "/users/:uid",
  async (request, reply) => {
    try {
      const id = Number(request.params.uid);
      await serviceBroker.update("users", [[id, [request.body as any]]]);
      reply.status(200).send({});
    } catch (error) {
      handleError(reply, error);
    }
  },
);

fastify.put<{ Params: { gid: string }; Body: any }>(
  "/groups/:gid",
  async (request, reply) => {
    try {
      const id = Number(request.params.gid);
      await serviceBroker.update("groups", [[id, [request.body as any]]]);
      reply.status(200).send({});
    } catch (error) {
      handleError(reply, error);
    }
  },
);

// Start the server
const start = async () => {
  try {
    await fastify.listen({ port: 8082 });
    console.log(`Groups REST wrapper listening at port 8082`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

// Graceful shutdown handler for:
// - SIGINT: Ctrl+C in terminal
// - SIGTERM: System termination requests (kill command, container orchestration, etc.)
["SIGTERM", "SIGINT"].forEach((sig) =>
  process.on(sig, async () => {
    await server.close();
    await fastify.close();
    console.log("\nServers shut down.");
  }),
);
