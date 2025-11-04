import { Mastra } from "@mastra/core";
import { swiftDoc } from "./agent/agent";
import { LibSQLStore } from "@mastra/libsql";
import { PinoLogger } from "@mastra/loggers";
import { a2aAgentRoute } from "./routes/a2a.route";

export const mastra = new Mastra({
  agents: { swiftDoc },
  storage: new LibSQLStore({ url: ":memory:" }),
  logger: new PinoLogger({
    name: "Mastra",
    level: "debug",
  }),
  observability: {
    default: {
      enabled: true,
    },
  },
  bundler: {
    externals: ["axios"],
  },
  server: {
    build: {
      openAPIDocs: true,
      swaggerUI: true,
    },
    apiRoutes: [a2aAgentRoute],
  },
});
