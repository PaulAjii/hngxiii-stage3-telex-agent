import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const synthesizeAnswerTool = createTool({
  id: "synthesize-answer",
  description:
    "Format response accordingly and send back to the user taking context from either get_cached_answer or search_web_for_context tools",
  inputSchema: z.object({
    query: z.string(),
    text: z.string(),
  }),
  outputSchema: z.string(),

  execute: async ({ context }) => {
    return context.text;
  },
});
