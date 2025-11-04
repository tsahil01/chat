import { tool } from "ai";
import { z } from "zod";
import { makeGitHubRequestWithFallback, makeGitHubRequest } from "./utils";

export const listGitHubPullRequests = tool({
  description: "List GitHub pull requests for a repository",
  inputSchema: z.object({
    owner: z.string().describe("Repository owner (username or organization)"),
    repo: z.string().describe("Repository name"),
  }),
  execute: async ({ owner, repo }) => {
    const pullRequests = await makeGitHubRequestWithFallback(
      `/repos/${owner}/${repo}/pulls`,
    );
    return `📋 Pull requests in ${owner}/${repo}:\n${pullRequests
      .map(
        (pullRequest: any) =>
          `• **#${pullRequest.number}** ${pullRequest.title}\n  👤 ${pullRequest.user.login} • 📅 ${new Date(pullRequest.created_at).toLocaleDateString()}\n  🔗 ${pullRequest.html_url}\n`,
      )
      .join("\n")}`;
  },
});

export const createGitHubPullRequest = tool({
  description: "Create a new GitHub pull request",
  inputSchema: z.object({
    owner: z.string().describe("Repository owner (username or organization)"),
    repo: z.string().describe("Repository name"),
    title: z.string().describe("Pull request title"),
    body: z.string().optional().describe("Pull request description"),
  }),
  execute: async ({ owner, repo, title, body }) => {
    const pullRequest = await makeGitHubRequest(
      `/repos/${owner}/${repo}/pulls`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, body }),
      },
    );
    return `✅ Pull request created successfully!\n📋 **#${pullRequest.number}** ${pullRequest.title}\n🔗 ${pullRequest.html_url}`;
  },
});

export const getGitHubPullRequest = tool({
  description: "Get detailed information about a specific GitHub pull request",
  inputSchema: z.object({
    owner: z.string().describe("Repository owner (username or organization)"),
    repo: z.string().describe("Repository name"),
    pullRequestNumber: z.number().describe("Pull request number"),
  }),
  execute: async ({ owner, repo, pullRequestNumber }) => {
    const pullRequest = await makeGitHubRequestWithFallback(
      `/repos/${owner}/${repo}/pulls/${pullRequestNumber}`,
    );
    return `📋 **#${pullRequest.number}** ${pullRequest.title}\n\n${pullRequest.body || "No description"}\n\n👤 **Author:** ${pullRequest.user.login}\n📅 **Created:** ${new Date(pullRequest.created_at).toLocaleDateString()}\n🏷️ **State:** ${pullRequest.state}\n${pullRequest.labels.length > 0 ? `🏷️ **Labels:** ${pullRequest.labels.map((label: any) => label.name).join(", ")}\n` : ""}🔗 ${pullRequest.html_url}`;
  },
});

export const viewCodeDiff = tool({
  description: "View the code diff for a specific GitHub pull request",
  inputSchema: z.object({
    owner: z.string().describe("Repository owner (username or organization)"),
    repo: z.string().describe("Repository name"),
    pullRequestNumber: z.number().describe("Pull request number"),
  }),
  execute: async ({ owner, repo, pullRequestNumber }) => {
    const pullRequest = await makeGitHubRequestWithFallback(
      `/repos/${owner}/${repo}/pulls/${pullRequestNumber}`,
    );
    return `📋 **#${pullRequest.number}** ${pullRequest.title}\n\n${pullRequest.body || "No description"}\n\n👤 **Author:** ${pullRequest.user.login}\n📅 **Created:** ${new Date(pullRequest.created_at).toLocaleDateString()}\n🏷️ **State:** ${pullRequest.state}\n${pullRequest.labels.length > 0 ? `🏷️ **Labels:** ${pullRequest.labels.map((label: any) => label.name).join(", ")}\n` : ""}🔗 ${pullRequest.html_url}`;
  },
});
