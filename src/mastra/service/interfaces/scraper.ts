import { ScrapedPageDto } from "../dto/scraper.dto";
import { SearchResultDto } from "../dto/search-result.dto";

export interface IScraperService {
  /**
   * Scrapes a list of search results concurrently.
   * @param urls An array of SearchResult objects from the search service.
   * @returns A promise that resolves to an array of ScrapedPage.
   */
  scrape(urls: SearchResultDto[]): Promise<ScrapedPageDto[]>;
}
