import axios, { AxiosInstance } from "axios";
import axiosRetry from "axios-retry";
import * as cheerio from "cheerio";
import pLimit from "p-limit";
import { IScraperService } from "./interfaces/scraper";
import { SearchResultDto } from "./dto/search-result.dto";
import { ScrapedPageDto } from "./dto/scraper.dto";

class WebScraper implements IScraperService {
  private client: AxiosInstance;
  private limit: pLimit.Limit;

  constructor(concurrency: number = 3) {
    this.client = axios.create({
      timeout: 5000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    axiosRetry(this.client, {
      retries: 1,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return (
          axios.isAxiosError(error) &&
          (error.response?.status === 503 ||
            error.response?.status === 429 ||
            error.code === "ECONNABORTED")
        );
      },
    });

    this.limit = pLimit(concurrency);
  }

  private async fetchAndParse(url: SearchResultDto): Promise<ScrapedPageDto> {
    try {
      const response = await this.client.get(url.link);
      const html = response.data;

      const $ = cheerio.load(html);
      $("nav, footer, script, style, .sidebar, .ad, .cookie-banner").remove();

      const contentSelectors =
        "article, main, .main-content, .post-body, .content, .entry-content";

      let contentBody = $(contentSelectors).first();

      if (contentBody.length === 0) {
        contentBody = $("body");
      }

      const textChunks: string[] = [];
      contentBody.find("p, h1, h2, h3, h4, li, pre, code").each((i, el) => {
        const text = $(el).text().trim();
        if (text) {
          textChunks.push(text);
        }
      });

      const cleanText = textChunks.join("\n");

      const title = $("h1").first().text().trim() || url.title;

      console.log(`Successfully parsed: ${url.link}`);

      return {
        sourceURL: url.link,
        title: title,
        content: cleanText,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch ${url.link}: ${error.message}`);
      } else {
        throw new Error(`Failed to parse ${url.link}: ${error.message}`);
      }
    }
  }

  public async scrape(urls: SearchResultDto[]): Promise<ScrapedPageDto[]> {
    const scrapePromises = urls.map((url) =>
      this.limit(() => this.fetchAndParse(url))
    );

    const results = await Promise.allSettled(scrapePromises);

    const successfulScrapes: ScrapedPageDto[] = results
      .filter((result) => {
        if (result.status === "rejected") {
          console.log(`A scrape task failed: ${result.reason?.message}`);
          return false;
        }
        return true;
      })
      .map(
        (result) => (result as PromiseFulfilledResult<ScrapedPageDto>).value
      );

    console.log(
      `Successfully scraped ${successfulScrapes.length} / ${urls.length} pages.`
    );
    return successfulScrapes;
  }
}

export const scraperService: IScraperService = new WebScraper();
