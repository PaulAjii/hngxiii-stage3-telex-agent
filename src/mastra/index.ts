import { Mastra } from "@mastra/core";
import { swiftDoc } from "./agent/agent";

export const mastra = new Mastra({
  agents: { swiftDoc },
});
