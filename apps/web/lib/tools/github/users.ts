import { tool } from "ai";
import { z } from "zod";
import { makeGitHubRequestWithFallback, handleGitHubError } from "./utils";

export const getGitHubUserInfo = tool({
  description: "Get GitHub user information",
  inputSchema: z.object({
    username: z
      .string()
      .optional()
      .describe("Username to look up (leave empty for authenticated user)"),
  }),
  execute: async ({ username }) => {
    try {
      const endpoint = username ? `/users/${username}` : "/user";

      // Try authenticated first, fallback to public if no auth
      const user = await makeGitHubRequestWithFallback(endpoint);

      return `👤 **${user.name || user.login}**\n${user.bio ? `📝 ${user.bio}\n` : ""}🔗 ${user.html_url}\n📍 ${user.location || "Location not set"}\n👥 ${user.followers} followers • ${user.following} following\n📂 ${user.public_repos} public repositories`;
    } catch (error: any) {
      return handleGitHubError(error, "fetch user information");
    }
  },
});

export const listGitHubFollowers = tool({
  description: "List GitHub followers for a user",
  inputSchema: z.object({
    username: z
      .string()
      .optional()
      .describe("Username to look up (leave empty for authenticated user)"),
    maxResults: z
      .number()
      .default(10)
      .describe("Maximum number of followers to return"),
  }),
  execute: async ({ username, maxResults }) => {
    try {
      const endpoint = username
        ? `/users/${username}/followers`
        : "/user/followers";

      // Try authenticated first, fallback to public if no auth
      const followers = await makeGitHubRequestWithFallback(
        `${endpoint}?per_page=${maxResults}`,
      );

      if (!followers || followers.length === 0) {
        return `👥 No followers found${username ? ` for ${username}` : ""}.`;
      }

      return `👥 Followers${username ? ` for ${username}` : ""}:\n${followers
        .map(
          (follower: any) =>
            `• **${follower.login}**\n  🔗 ${follower.html_url}\n`,
        )
        .join("\n")}`;
    } catch (error: any) {
      return handleGitHubError(error, "fetch followers");
    }
  },
});
