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

const DOCS_SUBDOMAIN_PATTERNS = [
  /^docs\./,
  /^documentation\./,
  /^api\./,
  /^developer\./,
  /^guide\./,
  /^spec\./,
];

const DOCS_PATH_PATTERNS = [
  /^\/docs/,
  /^\/documentation/,
  /^\/api/,
  /^\/guides/,
  /^\/spec/,
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

    console.log(`[SourceScorer] Ranked results`);
    return scoredResults;
  }

  private isDomainOrSubdomain(
    hostname: string,
    domainSet: Set<string>
  ): boolean {
    if (domainSet.has(hostname)) {
      return true;
    }

    for (const domain of domainSet) {
      if (hostname.endsWith(`${domain}`)) {
        return true;
      }
    }
    return false;
  }

  private scoreUrl(url: string): {
    score: number;
    priority: RankedSearchResult["priority"];
  } {
    try {
      const { hostname, pathname } = new URL(url);
      if (TOP_TIER_DOMAINS.has(hostname)) {
        return { score: 100, priority: "TOP" };
      }

      if (
        DOCS_SUBDOMAIN_PATTERNS.some((pattern) => pattern.test(hostname)) ||
        DOCS_PATH_PATTERNS.some((pattern) => pattern.test(pathname))
      ) {
        return { score: 75, priority: "DOCS" };
      }

      if (this.isDomainOrSubdomain(hostname, COMMUNITY_SITES)) {
        return { score: 50, priority: "COMMUNITY" };
      }

      if (this.isDomainOrSubdomain(hostname, BLOG_PLATFORMS)) {
        return { score: 25, priority: "BLOG" };
      }

      return { score: 10, priority: "OTHER" };
    } catch (error) {
      console.log(
        `Failed to parse URL: ${url}. Returning score: 0 and priority: OTHER`
      );
      return { score: 0, priority: "OTHER" };
    }
  }
}

export const sourceScorerService = new SourceScorerService();
