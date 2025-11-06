import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const synthesizeAnswerTool = createTool({
  id: "synthesize-answer",
  description:
    "Format response accordingly and send back to the user taking context from either get_cached_answer or search_web_for_context tools",
  inputSchema: z.object({
    output: z.string(),
  }),
  outputSchema: z.object({
    text: z.string(),
  }),

  execute: async ({ context }) => {
    return { text: context.output };
  },
});
