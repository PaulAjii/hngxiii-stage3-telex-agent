import { SearchResultDto } from "./dto/search-result.dto";

const TOP_TIER_DOMAINS = new Set([
  "developer.mozilla.org",
  "nodejs.org",
  "python.org",
  "djangoproject.com",
  "react.dev",
  "vuejs.org",
  "angular.io",
  "typescriptlang.org",
  "mastra.ai",
]);

const DOCS_PATTERNS = [
  /docs\./,
  /documentation\./,
  /api\./,
  /developer\./,
  /guide\./,
  /spec\./,
];

const COMMUNITY_SITES = new Set(["stackoverflow.com", "stackexchange.com"]);

const BLOG_PLATFORMS = new Set([
  "medium.com",
  "dev.to",
  "hashnode.com",
  "freecodecamp.org",
  "baeldung.com",
  "css-tricks.com",
]);

export interface RankedSearchResult extends SearchResultDto {
  score: number;
  priority: "TOP" | "DOCS" | "COMMUNITY" | "BLOG" | "OTHER";
}

export class SourceScorerService {
  constructor() {
    console.log("[SourceScorer] Initialized with heuristic scoring rules.");
  }

  public rankResults(results: SearchResultDto[]): RankedSearchResult[] {
    const scoredResults = results.map((result) => {
      const { score, priority } = this.scoreUrl(result.link);
      return { ...result, score, priority };
    });

    scoredResults.sort((a, b) => b.score - a.score);

    console.log(
      `[SourceScorer] Ranked results: ${JSON.stringify(
        scoredResults.map((r) => ({ url: r.link, score: r.score }))
      )}`
    );
    return scoredResults;
  }

  private scoreUrl(url: string): {
    score: number;
    priority: RankedSearchResult["priority"];
  } {
    try {
      const { hostname } = new URL(url);
      if (TOP_TIER_DOMAINS.has(hostname)) {
        return { score: 100, priority: "TOP" };
      }

      if (DOCS_PATTERNS.some((pattern) => pattern.test(hostname))) {
        return { score: 75, priority: "DOCS" };
      }

      if (
        COMMUNITY_SITES.has(hostname) ||
        [...COMMUNITY_SITES].some((d) => hostname.endsWith(`.${d}`))
      ) {
        return { score: 50, priority: "COMMUNITY" };
      }

      if (
        BLOG_PLATFORMS.has(hostname) ||
        [...BLOG_PLATFORMS].some((d) => hostname.endsWith(`.${d}`))
      ) {
        return { score: 25, priority: "BLOG" };
      }

      return { score: 10, priority: "OTHER" };
    } catch (error) {
      console.log(error);
      return { score: 0, priority: "OTHER" }; // Penalize bad URLs
    }
  }
}

export const sourceScorerService = new SourceScorerService();
