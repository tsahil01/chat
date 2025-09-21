import { ToolSet } from "ai";
import { exaWebSearch } from "./web-search";
import { 
  createCalendarEvent, 
  deleteCalendarEvent,
  listCalendarEvents, 
  checkCalendarAvailability,
  listEmails,
  getEmail,
  searchEmails,
  sendEmail
} from "./google";

import { 
  listGitHubRepos, 
  createGitHubRepo, 
  getGitHubRepoInfo,
  listGitHubIssues, 
  createGitHubIssue, 
  getGitHubIssue,
  getGitHubUserInfo,
  listGitHubFollowers,
  listGitHubPullRequests,
  createGitHubPullRequest,
  getGitHubPullRequest,
  viewCodeDiff
} from "./github";

const tools: ToolSet = {
  // Web search
  exaWebSearch,
  
  // Google Calendar
  createCalendarEvent,
  deleteCalendarEvent,
  listCalendarEvents,
  checkCalendarAvailability,

  // Google Email
  // listEmails,
  // getEmail,
  // searchEmails,
  // sendEmail,
  
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
  
  // GitHub Pull Requests
  listGitHubPullRequests,
  createGitHubPullRequest,
  getGitHubPullRequest,
  viewCodeDiff
};

export default tools;