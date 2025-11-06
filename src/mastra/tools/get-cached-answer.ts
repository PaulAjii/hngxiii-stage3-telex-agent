import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { createSingleEmbedding } from "../utils/embedding-util";
import store from "../config/db";

export const getCachedAnswerTool = createTool({
  id: "get-cached-answer",
  description:
    "Checks if a relevant answer already exists in the vector database. It takes the user's query, creates an embedding, and searches the database",
  inputSchema: z.object({
    query: z.string(),
  }),
  outputSchema: z.object({
    output: z.string(),
  }),
  execute: async ({ context }) => {
    const embeddings = await createSingleEmbedding(context.query);

    const result = await store.query({
      indexName: "hngindex",
      queryVector: embeddings,
      topK: 5,
      includeVector: true,
    });

    const texts = result.map((res) => {
      if (!res.metadata) {
        return "";
      }
      return res.metadata.text;
    });

    return {
      output: texts.join("\n"),
    };
  },
});
