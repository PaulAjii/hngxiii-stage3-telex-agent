# Synapse - An Intelligent RAG AI Agent

Synapse is an expert AI technical assistant and programming partner built on the Mastra framework. It's designed to provide accurate, fast, and relevant answers to complex technical questions by grounding all its responses in real-time information from official documentation and technical blogs.

## Unlike a standard chatbot, Synapse is a true Dynamic Retrieval-Augmented Generation (RAG) agent. It doesn't just guess answers; it finds them.

## Core Features

- Dynamic RAG Workflow: When an answer isn't in its cache, Synapse actively searches the live web, reads the most relevant documentation, and synthesizes an answer based on those new facts.

- Smart Source Scoring: Synapse intelligently prioritizes its search results. It uses a pattern-based scoring system (SourceScorerService) to identify and prefer official documentation (docs.nestjs.com, api.vue.org) over generic blogs, ensuring the highest quality context.

- Optimistic Caching: Answers from new web searches are returned to the user immediately (low latency), while a non-blocking background tool (addToCacheTool) saves the new knowledge to the Pinecone vector database for future queries.

- Resilient & Concurrent Scraping: Uses axios-retry and p-limit to robustly scrape multiple web pages at once, handling timeouts and errors gracefully.

## \_ Mastra-Native Tooling: The entire complex workflow is orchestrated as a series of modular, pluggable tools (getCachedAnswerTool, searchWebForContextTool, etc.) for the Mastra agent to use.

## How It Works: The Agent's "Brain"

Synapse's logic follows a precise, multi-step workflow on every query:

- Check Cache: The getCachedAnswerTool is called first. It embeds the user's query (google/text-embedding-004) and searches Pinecone for a high-confidence match.

- Cache Hit: If found, the context is used by synthesizeAnswerTool and returned instantly.

- Cache Miss: The agent proceeds to Step 2.

- Dynamic RAG: The searchWebForContextTool is triggered.

- Search: searchService calls the Google Search API for 10 relevant URLs.

- Rank: sourceScorerService ranks all 10 URLs, giving >100 points to TOP_TIER_DOMAINS (like developer.mozilla.org) and 75 points to URLs matching DOCS_PATTERNS (like docs.\*).

- Scrape: scraperService concurrently scrapes the Top 3 highest-ranked pages using cheerio to extract clean, relevant text.

- Synthesize & Respond: The scraped context is passed to synthesizeAnswerTool. The glm-4.6 model generates a final, factual answer, which is sent to the user.

- Non-Blocking Cache: After the response is sent, addToCacheTool runs in the background to embed and save the new context to Pinecone for future use.

## Core Technology Stack

1. AI Framework: Mastra["https://mastra.ai"] (@mastra/core)

2. Agent LLM: Z AI (zhipuai-coding-plan/glm-4.6)

3. Embedding Model: Google (google/text-embedding-004)

4. Vector Database: Pinecone (@mastra/pinecone)

5. Chat Memory: LibSQL (@mastra/libsql)

6. Web Search: Google Custom Search JSON API

7. Web Scraping: axios, cheerio, p-limit, axios-retry

8. Language & Runtime: TypeScript

9. Package Manager: pnpm

---

## Project Structure

Here is a brief overview of the core files and directories:

- _src/mastra/index.ts_: The main entry point for the Mastra application. It initializes the Mastra server, logger, storage, and registers the agent and API routes.

- _src/mastra/agent/agent.ts_: Defines the swiftDoc agent. This file contains the master system prompt (instructions), model configuration (glm-4.6), and registers all the tools the agent can use.

- _src/mastra/tools/_: Contains all modular tools the agent can call.

  - _get-cached-answer.ts_: Tool to search the Pinecone vector DB for an existing answer.

  - _search-web-context.ts_: The main RAG orchestrator. Calls the search, rank, and scrape services.

  - _synthesize-answer.ts_: Tool that passes the context and query to the LLM for the final response.

  - _add-to-cache.ts_: Background tool to save new, scraped context to Pinecone.

- _src/mastra/service/_: Holds all the external logic and API integrations.

  - _search.service.ts_: Handles API calls to the Google Custom Search API, with axios-retry.

  - _scraper.service.ts_: A robust, concurrent web scraper built with axios, cheerio, and p-limit.

  - _source-scorer.service.ts_: The "secret sauce." Ranks Google search results based on domain patterns to find the most trustworthy sources.

- _src/mastra/config/db.ts_: Configures and exports the Mastra PineconeVector client, connecting to the hngindex in Pinecone.

- _src/mastra/utils/embedding-util.ts_: Helper functions to create embeddings for queries and context chunks using Google's text-embedding-004.

- _src/mastra/routes/a2a.route.ts_: Defines the public-facing /a2a/agent/:agentId route that allows external services (like Telex.im) to communicate with the agent.

### Folder Structure

src/
└── mastra/
├── index.ts # Main Mastra app entry point
├── agent/
│ └── agent.ts # Agent definition & system prompt
├── config/
│ └── db.ts # Pinecone DB client configuration
├── routes/
│ └── a2a.route.ts # A2A (Agent-to-Agent) API route
├── service/
│ ├── scraper.service.ts
│ ├── search.service.ts
│ ├── source-scorer.service.ts
│ ├── dto/
│ │ ├── scraper.dto.ts
│ │ └── search-result.dto.ts
│ └── interfaces/
│ ├── google-search.ts
│ └── scraper.ts
├── tools/
│ ├── add-to cache.ts
│ ├── get-cached-answer.ts
│ ├── index.ts # Exports all tools
│ ├── search-web-context.ts
│ └── synthesize-answer.ts
└── utils/
└── embedding-util.ts # Embedding helper functions

Setup & Configuration

Clone the repository:

```bash
git clone [YOUR_REPO_URL]
cd [YOUR_PROJECT_DIRECTORY]
```

Install dependencies:

```bash
pnpm install
```

Create a .env file in the root and add the following environment variables:

```bash
# Mastra & Z AI
ZHIPUAI_API_KEY=sk-xxxxxxxxxx

# Pinecone Vector DB
PINECONE_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Google Search API
# (From Google Cloud Console)
GOOGLE_SEARCH_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxx

# (From Programmable Search Engine control panel)
GOOGLE_SEARCH_ENGINE_ID=xxxxxxxxxxxxxxxxxxxx
```

Running the Project

You can run the agent locally using the Mastra CLI:

```bash
# Start the Mastra development server
pnpm dev
```

This will start the server (typically on http://localhost:4111) and expose the A2A (Agent-to-Agent) route at /a2a/agent/swiftDoc for integration.
