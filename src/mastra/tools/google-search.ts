import { createTool } from "@mastra/core/tools";
import { searchService } from "../service/search.service";
import { sourceScorerService } from "../service/source-scorer.service";
import { z } from "zod";

export const rankedSearchResultSchema = z.object({
  title: z.string(),
  link: z.string(),
  snippet: z.string(),
  score: z.number(),
  priority: z.enum(["TOP", "DOCS", "COMMUNITY", "BLOG", "OTHER"]),
});

export const googleSerachTool = createTool({
  id: "google-search",
  description:
    "Makes a google search for relevant context when the get-cached-answer tool does not return relevant results",
  inputSchema: z.object({
    query: z.string(),
  }),
  outputSchema: z.array(rankedSearchResultSchema),
  execute: async ({ context }) => {
    try {
      console.log(`Searching for context for ${context.query}`);
      const results = await searchService.search(context.query, 5);
      if (!results || results.length === 0) {
        return [];
      }
      const rankedResults = sourceScorerService.rankResults(results);
      return rankedResults;
    } catch (error) {
      console.log(`Search error: ${error.message}`);
      return [];
    }
  },
});
