import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import fastify from "fastify";
import { createContext } from "./context";
import { appRouter } from "./routes/router";
import { logger } from "@cornerstone/core";

const server = fastify({ maxParamLength: 5000, logger: true });

async function main() {
  await server.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: { router: appRouter, createContext },
  });

  try {
    await server.listen({ port: 3000 });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main().catch((error: unknown) => logger.error({ error }));
