import { ISearchService } from "./interfaces/google-search";
import { SearchResultDto } from "./dto/search-result.dto";
import axios, { AxiosInstance } from "axios";
import axiosRetry from "axios-retry";

const googleSearchApiUrl = "https://www.googleapis.com/customsearch/v1";

class GoogleSearch implements ISearchService {
  private client: AxiosInstance;
  private apiKey: string;
  private searchEngineId: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_SEARCH_API_KEY || "";
    this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID || "";
    this.client = axios.create({
      baseURL: googleSearchApiUrl,
      timeout: 3000,
    });

    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return (
          axios.isAxiosError(error) &&
          (error.response?.status === 503 ||
            error.response?.status === 500 ||
            error.code === "ECONNABORTED")
        );
      },
    });
  }

  public async search(
    query: string,
    count: number
  ): Promise<SearchResultDto[]> {
    if (!this.apiKey || !this.searchEngineId) {
      throw new Error("Missing API key or Search Engine ID");
    }

    try {
      console.log(`Searching for ${query} with ${count} results...`);
      const response = await this.client.get("", {
        params: {
          key: this.apiKey,
          cx: this.searchEngineId,
          q: query,
          num: count,
        },
      });

      if (!response.data || !response.data.items) {
        return [];
      }

      const results: SearchResultDto[] = response.data.items
        .map((item: any) => ({
          title: item.title,
          link: item.link,
          snippet: item.snippet,
        }))
        .filter((item: SearchResultDto) => item.link);

      return results;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.message);
      } else {
        throw new Error("Unknown error occured");
      }
    }
  }
}

export const searchService: ISearchService = new GoogleSearch();
