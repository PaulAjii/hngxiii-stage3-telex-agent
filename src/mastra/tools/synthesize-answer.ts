import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const synthesizeAnswerTool = createTool({
  id: "synthesize-answer-tool",
  description:
    "This is the FINAL tool. Call this to synthesize the user's query and the retrieved context into a final, helpful answer.",
  inputSchema: z.object({
    query: z.string().describe("The user's original question."),
    context: z
      .string()
      .describe("The context from the cache OR the web scraper."),
  }),
  outputSchema: z.string(),

  execute: async ({ context }) => {
    return context.context;
  },
});
