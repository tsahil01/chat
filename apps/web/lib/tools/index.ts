import { Tool, ToolSet } from "ai";
import { exaWebSearch, firecrawlWebSearch } from "./web-search";

const tools: ToolSet = {
  exaWebSearch,
};

export default tools;