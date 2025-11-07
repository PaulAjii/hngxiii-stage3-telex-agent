import { rankedSearchResultSchema } from "./google-search";
import { scraperService } from "../service/scraper.service";
import { z } from "zod";
import { createTool } from "@mastra/core/tools";
import { RankedSearchResult } from "../service/source-scorer.service";

export const scrapeTool = createTool({
  id: "scrape-tool",
  description:
    "Takes an array of rankedResults **AS IS** from googleSearchTool as an array, scrapes them, and formats them into a single context string to be sent to the user.",
  inputSchema: z.object({
    rankedResults: z.array(rankedSearchResultSchema),
    query: z.string(),
  }),
  outputSchema: z.object({
    output: z.string(),
    query: z.string(),
  }),
  execute: async ({ context }) => {
    try {
      const topResults: RankedSearchResult[] = context.rankedResults.slice(
        0,
        3
      );

      console.log(
        `Scraping the top 3 results: ${topResults.map((r) => r.link).join(",")}`
      );
      const scrapedPages = await scraperService.scrape(topResults);

      if (!scrapedPages || scrapedPages.length === 0) {
        return { output: "", query: context.query };
      }
      const contextString = scrapedPages.map((page, i) => {
        const originalRank = topResults.find((r) => r.link === page.sourceURL);

        return `
---- CONTEXT ${i + 1} ----
SOURCE_PRIORITY_SCORE: ${originalRank?.score || 0}
SOURCE_PRIORITY: ${originalRank?.priority || "OTHER"}
SOURCE_URL: ${page.sourceURL}
SOURCE_TITLE: ${page.title}
CONTENT: ${page.content}
---- END CONTEXT ${i + 1} ----
                `;
      });

      return { output: contextString.join("\n"), query: context.query };
    } catch (error) {
      console.log(`Error with scraping: ${error.message}`);
      return {
        output: "Error while scraping the search results",
        query: context.query,
      };
    }
  },
});
