import { ToolSet } from "ai";
import { exaWebSearch } from "./web-search";
import { 
  createCalendarEvent, 
  listCalendarEvents, 
  checkCalendarAvailability 
} from "./google";

import { 
  listGitHubRepos, 
  createGitHubRepo, 
  getGitHubRepoInfo,
  listGitHubIssues, 
  createGitHubIssue, 
  getGitHubIssue,
  getGitHubUserInfo,
  listGitHubFollowers
} from "./github";

const tools: ToolSet = {
  // Web search
  exaWebSearch,
  
  // Google Calendar
  createCalendarEvent,
  listCalendarEvents,
  checkCalendarAvailability,
  
  // GitHub Repositories
  listGitHubRepos,
  createGitHubRepo,
  getGitHubRepoInfo,
  
  // GitHub Issues
  listGitHubIssues,
  createGitHubIssue,
  getGitHubIssue,
  
  // GitHub Users
  getGitHubUserInfo,
  listGitHubFollowers,
};

export default tools;