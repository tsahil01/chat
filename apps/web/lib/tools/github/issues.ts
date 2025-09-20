import { tool } from 'ai';
import { z } from 'zod';
import { makeGitHubRequest, makeGitHubRequestWithFallback, handleGitHubError } from './utils';

export const listGitHubIssues = tool({
  description: 'List GitHub issues for a repository',
  inputSchema: z.object({
    owner: z.string().describe('Repository owner (username or organization)'),
    repo: z.string().describe('Repository name'),
    state: z.enum(['open', 'closed', 'all']).default('open').describe('Issue state'),
    maxResults: z.number().default(10).describe('Maximum number of issues to return'),
  }),
  execute: async ({ owner, repo, state, maxResults }) => {
    try {
      // Try authenticated first, fallback to public if no auth
      const issues = await makeGitHubRequestWithFallback(`/repos/${owner}/${repo}/issues?state=${state}&per_page=${maxResults}`);

      if (!issues || issues.length === 0) {
        return `📋 No ${state} issues found in ${owner}/${repo}.`;
      }

      return `📋 Issues in ${owner}/${repo}:\n${issues.map((issue: any) => 
        `• **#${issue.number}** ${issue.title}\n  👤 ${issue.user.login} • 📅 ${new Date(issue.created_at).toLocaleDateString()}\n  🔗 ${issue.html_url}\n`
      ).join('\n')}`;
    } catch (error: any) {
      return handleGitHubError(error, 'fetch issues');
    }
  },
});

export const createGitHubIssue = tool({
  description: 'Create a new GitHub issue',
  inputSchema: z.object({
    owner: z.string().describe('Repository owner (username or organization)'),
    repo: z.string().describe('Repository name'),
    title: z.string().describe('Issue title'),
    body: z.string().optional().describe('Issue description'),
    labels: z.array(z.string()).optional().describe('Issue labels'),
  }),
  execute: async ({ owner, repo, title, body, labels }) => {
    try {
      const issue = await makeGitHubRequest(`/repos/${owner}/${repo}/issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          body,
          labels,
        }),
      });

      return `✅ Issue created successfully!\n📋 **#${issue.number}** ${issue.title}\n🔗 ${issue.html_url}`;
    } catch (error: any) {
      return handleGitHubError(error, 'create issue');
    }
  },
});

export const getGitHubIssue = tool({
  description: 'Get detailed information about a specific GitHub issue',
  inputSchema: z.object({
    owner: z.string().describe('Repository owner (username or organization)'),
    repo: z.string().describe('Repository name'),
    issueNumber: z.number().describe('Issue number'),
  }),
  execute: async ({ owner, repo, issueNumber }) => {
    try {
      // Try authenticated first, fallback to public if no auth
      const issue = await makeGitHubRequestWithFallback(`/repos/${owner}/${repo}/issues/${issueNumber}`);

      return `📋 **#${issue.number}** ${issue.title}\n\n${issue.body || 'No description'}\n\n👤 **Author:** ${issue.user.login}\n📅 **Created:** ${new Date(issue.created_at).toLocaleDateString()}\n🏷️ **State:** ${issue.state}\n${issue.labels.length > 0 ? `🏷️ **Labels:** ${issue.labels.map((label: any) => label.name).join(', ')}\n` : ''}🔗 ${issue.html_url}`;
    } catch (error: any) {
      return handleGitHubError(error, 'fetch issue');
    }
  },
});