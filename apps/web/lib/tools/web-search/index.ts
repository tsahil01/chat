import { tool } from "ai";
import { z } from "zod";
import Exa from "exa-js";
import FirecrawlApp from "@mendable/firecrawl-js";
import { Parallel } from "parallel-web";

const parallel = new Parallel({
  apiKey: process.env.PARALLEL_API_KEY as string,
});
export const exa = new Exa(process.env.EXA_API_KEY as string);
const firecrawlApp = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY as string,
});

export const parallelWebSearch = tool({
  description: "Use this tool to search the web.",
  inputSchema: z.object({
    searchQueries: z.array(z.string()).describe("Search queries"),
    usersQuestion: z.string().describe("The user's question"),
  }),
  execute: async ({ searchQueries, usersQuestion }) => {
    const search = await parallel.beta.search({
      objective: usersQuestion,
      search_queries: searchQueries,
      max_results: 3,
      max_chars_per_result: 1000,
    });
    return search.results;
  },
});

export const exaWebSearch = tool({
  description: "Search the web for up-to-date information",
  inputSchema: z.object({
    query: z.string().min(1).max(100).describe("The search query"),
  }),
  execute: async ({ query }) => {
    const { results } = await exa.searchAndContents(query, {
      livecrawl: "always",
      numResults: 3,
    });
    return results.map((result) => ({
      title: result.title,
      url: result.url,
      content: result.text.slice(0, 1000), // take just the first 1000 characters
      publishedDate: result.publishedDate,
    }));
  },
});

export const firecrawlWebSearch = tool({
  description: "Crawl a website and return the markdown and html content.",
  inputSchema: z.object({
    urlToCrawl: z
      .string()
      .url()
      .min(1)
      .max(100)
      .describe("The URL to crawl (including http:// or https://)"),
  }),
  execute: async ({ urlToCrawl }: { urlToCrawl: string }) => {
    const crawlResponse = await firecrawlApp.crawl(urlToCrawl, {
      limit: 1,
      scrapeOptions: {
        formats: ["markdown", "html"],
      },
    });
    console.log("crawlResponse", crawlResponse);
    return crawlResponse;
  },
});
