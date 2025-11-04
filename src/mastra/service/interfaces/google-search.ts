import { SearchResultDto } from "../dto/search-result.dto";

export interface ISearchService {
  /**
   * Searches the web for a given query.
   * @param query The search query.
   * @param count The number of results to return.
   * @returns A promise that resolves to an array of SearchResult.
   */
  search(query: string, count: number): Promise<SearchResultDto[]>;
}
