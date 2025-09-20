import { ToolSet } from "ai";
import { exaWebSearch } from "./web-search";
import { createCalendarEvent, listCalendarEvents, checkCalendarAvailability } from "./google";

const tools: ToolSet = {
  exaWebSearch,
  createCalendarEvent,
  listCalendarEvents,
  checkCalendarAvailability,
};

export default tools;