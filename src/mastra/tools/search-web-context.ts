import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { sourceScorerService } from "../service/source-scorer.service";
import { searchService } from "../service/search.service";
import { scraperService } from "../service/scraper.service";

export const searchWebForContextTool = createTool({
  id: "search-web-for-context",
  description:
    "Search web for context for query when database search does not return relevant results",
  inputSchema: z.object({
    query: z.string(),
  }),
  outputSchema: z.object({
    output: z.string(),
  }),
  execute: async ({ context }) => {
    try {
      const results = await searchService.search(context.query, 10);

      if (!results || results.length === 0) {
        console.log(`No results found for query: ${context.query}`);
        return { output: "" };
      }

      const reankedResults = sourceScorerService.rankResults(results);
      const topResults = reankedResults.slice(0, 5);

      console.log(
        `Top 3 ranked results to scrape: ${topResults
          .map((r) => r.link)
          .join(", ")}`
      );

      const scrapedPages = await scraperService.scrape(topResults);
      if (!scrapedPages || scrapedPages.length === 0) {
        console.log(`Scraping failed for all top results`);
        return { output: "" };
      }

      const contextString = scrapedPages
        .map((page, index) => {
          const originalRank = reankedResults.find(
            (r) => r.link === page.sourceURL
          );

          return `
        ---[START CONTEXT ${index + 1}]---
Source-Priority-Score: ${originalRank?.score || 0}
Source-URL: ${page.sourceURL}
Source-Title: ${page.title}

Content:
${page.content}
---[END CONTEXT ${index + 1}]---
        `;
        })
        .join("\n\n");
      console.log(
        `Successfully generated context string of ${contextString.length} chars.`
      );

      return { output: contextString };
    } catch (error) {
      console.log(`Critical error: ${error}`);
      return { output: "There was an error processing your request" };
    }
  },
});
