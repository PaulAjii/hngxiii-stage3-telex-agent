import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { createMultipleEmbeddings } from "../utils/embedding-util";
import store from "../config/db";

export const addToCacheTool = createTool({
  id: "add-to-cache",
  description: "Add output from search-web-for-context to vector database",
  inputSchema: z.object({
    context: z.string(),
  }),
  execute: async ({ context }) => {
    try {
      const { chunks, multipleEmbeddings } = await createMultipleEmbeddings(
        context.context
      );

      console.log("Saving into the database....");
      await store.upsert({
        indexName: "hngindex",
        vectors: multipleEmbeddings,
        metadata: chunks.map((c) => ({
          text: c.text,
          id: c.id_,
        })),
      });
      console.log("Saved the embeddigns into the database");
    } catch (error) {
      console.log(`There was an error adding to cache: ${error.message}`);
    }
  },
});
