import { tool } from "ai";
import { z } from "zod";
import Exa from "exa-js";
import FirecrawlApp from "@mendable/firecrawl-js";

export const exa = new Exa(process.env.EXA_API_KEY as string);

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

const firecrawlApp = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY,
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
