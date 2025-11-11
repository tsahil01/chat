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
  sendEmail,
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
  viewCodeDiff,
} from "./github";
import { Integration } from "@workspace/db";

const githubTools: ToolSet = {
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
  viewCodeDiff,
};

const googleTools: ToolSet = {
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
};

export const getTools = (integrations: Integration[]) => {
  let tools: ToolSet = {
    exaWebSearch,
  };

  if (
    integrations.some(
      (integration: Integration) => integration.name === "github"
    )
  ) {
    tools = {
      ...tools,
      ...githubTools,
    };
  }

  if (
    integrations.some(
      (integration: Integration) => integration.name === "google"
    )
  ) {
    tools = {
      ...tools,
      ...googleTools,
    };
  }
  return tools;
};
