import { tool } from 'ai';
import { z } from 'zod';
import { makeGitHubRequest, handleGitHubError } from './utils';

export const listGitHubRepos = tool({
  description: 'List user\'s GitHub repositories',
  inputSchema: z.object({
    maxResults: z.number().default(10).describe('Maximum number of repositories to return'),
    type: z.enum(['all', 'owner', 'public', 'private']).default('all').describe('Type of repositories to list'),
    sort: z.enum(['created', 'updated', 'pushed', 'full_name']).default('updated').describe('Sort repositories by'),
  }),
  execute: async ({ maxResults, type, sort }) => {
    try {
      const repos = await makeGitHubRequest(`/user/repos?type=${type}&sort=${sort}&per_page=${maxResults}`);

      if (!repos || repos.length === 0) {
        return "📂 No repositories found.";
      }

      return `📂 Your GitHub repositories:\n${repos.map((repo: any) => 
        `• **${repo.name}** ${repo.private ? '🔒' : '🌍'}\n  ${repo.description || 'No description'}\n  ${repo.html_url}\n  ⭐ ${repo.stargazers_count} stars, 🍴 ${repo.forks_count} forks\n`
      ).join('\n')}`;
    } catch (error: any) {
      return handleGitHubError(error, 'fetch repositories');
    }
  },
});

export const createGitHubRepo = tool({
  description: 'Create a new GitHub repository',
  inputSchema: z.object({
    name: z.string().describe('Repository name'),
    description: z.string().optional().describe('Repository description'),
    private: z.boolean().default(false).describe('Whether the repository should be private'),
    autoInit: z.boolean().default(true).describe('Whether to initialize with README'),
  }),
  execute: async ({ name, description, private: isPrivate, autoInit }) => {
    try {
      const repo = await makeGitHubRequest('/user/repos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          private: isPrivate,
          auto_init: autoInit,
        }),
      });

      return `✅ Repository "${name}" created successfully!\n🔗 ${repo.html_url}\n${isPrivate ? '🔒 Private' : '🌍 Public'} repository`;
    } catch (error: any) {
      return handleGitHubError(error, 'create repository');
    }
  },
});

export const getGitHubRepoInfo = tool({
  description: 'Get detailed information about a GitHub repository',
  inputSchema: z.object({
    owner: z.string().describe('Repository owner (username or organization)'),
    repo: z.string().describe('Repository name'),
  }),
  execute: async ({ owner, repo }) => {
    try {
      const repoData = await makeGitHubRequest(`/repos/${owner}/${repo}`);

      return `📂 **${repoData.full_name}**\n${repoData.description || 'No description'}\n\n🔗 ${repoData.html_url}\n${repoData.private ? '🔒 Private' : '🌍 Public'} repository\n⭐ ${repoData.stargazers_count} stars\n🍴 ${repoData.forks_count} forks\n👁️ ${repoData.watchers_count} watchers\n\n📅 Created: ${new Date(repoData.created_at).toLocaleDateString()}\n📅 Updated: ${new Date(repoData.updated_at).toLocaleDateString()}\n📝 Language: ${repoData.language || 'Not specified'}`;
    } catch (error: any) {
      return handleGitHubError(error, 'fetch repository information');
    }
  },
});