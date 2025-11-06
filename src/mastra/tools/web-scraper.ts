import { rankedSearchResultSchema } from "./google-search";
import { scraperService } from "../service/scraper.service";
import { z } from "zod";
import { createTool } from "@mastra/core/tools";

export const scrapeTool = createTool({
  id: "scrape-tool",
  description:
    "Takes a list of ranked search results, scrapes the top 3, and formats them into a single context string.",
  inputSchema: z.object({
    results: z.array(rankedSearchResultSchema),
  }),
  outputSchema: z.object({
    output: z.string(),
  }),
  execute: async ({ context }) => {
    try {
      const topResults = context.results.slice(0, 3);

      console.log(
        `Scraping the top 3 results: ${topResults.map((r) => r.link).join(",")}`
      );
      const scrapedPages = await scraperService.scrape(topResults);

      if (!scrapedPages || scrapedPages.length === 0) {
        return { output: "" };
      }
      const contextString = scrapedPages
        .map((page, i) => {
          const originalRank = topResults.find(
            (r) => r.link === page.sourceURL
          );

          return `
---- CONTEXT ${i + 1} ----
SOURCE_PRIORITY_SCORE: ${originalRank?.score || 0}
SOURCE_PRIORITY: ${originalRank?.priority || "OTHER"}
SOURCE_URL: ${page.sourceURL}
SOURCE_TITLE: ${page.title}
CONTENT: ${page.content}
---- END CONTEXT ${i + 1} ----
                `;
        })
        .join("\n");

      return { output: contextString };
    } catch (error) {
      console.log(`Error with scraping: ${error.message}`);
      return { output: "Error while scraping the search results" };
    }
  },
});
