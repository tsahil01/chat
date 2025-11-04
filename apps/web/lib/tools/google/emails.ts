import { tool } from "ai";
import {
  handleGoogleError,
  getCurrentUserGoogleAccount,
  createGoogleGmailClient,
} from "./utils";
import { z } from "zod";

export const listEmails = tool({
  description: "List emails",
  inputSchema: z.object({
    maxResults: z.number().describe("Maximum number of emails to return"),
  }),
  execute: async ({ maxResults }) => {
    try {
      const { googleAccount } = await getCurrentUserGoogleAccount();
      const gmail = createGoogleGmailClient(googleAccount);
      const emails = await gmail.users.messages.list({
        userId: "me",
        maxResults,
      });
      return `✅ Emails listed successfully: "${emails.data.messages?.length}".`;
    } catch (error: any) {
      return handleGoogleError(error, "list emails");
    }
  },
});

export const getEmail = tool({
  description: "Get an email",
  inputSchema: z.object({
    emailId: z.string().describe("Email ID"),
  }),
  execute: async ({ emailId }) => {
    try {
      const { googleAccount } = await getCurrentUserGoogleAccount();
      const gmail = createGoogleGmailClient(googleAccount);
      const email = await gmail.users.messages.get({
        userId: "me",
        id: emailId,
      });
      return `✅ Email retrieved successfully: "${email.data.id}".`;
    } catch (error: any) {
      return handleGoogleError(error, "get email");
    }
  },
});

export const searchEmails = tool({
  description: "Search emails",
  inputSchema: z.object({
    query: z.string().describe("Search query"),
  }),
  execute: async ({ query }) => {
    try {
      const { googleAccount } = await getCurrentUserGoogleAccount();
      const gmail = createGoogleGmailClient(googleAccount);
      const emails = await gmail.users.messages.list({
        userId: "me",
        q: query,
      });
      return `✅ Emails searched successfully: "${emails.data.messages?.length}".`;
    } catch (error: any) {
      return handleGoogleError(error, "search emails");
    }
  },
});

export const sendEmail = tool({
  description: "Send an email",
  inputSchema: z.object({
    to: z.string().describe("Email address of the recipient"),
    subject: z.string().describe("Email subject"),
    body: z.string().describe("Email body"),
  }),
  execute: async ({ to, subject, body }) => {
    try {
      const { googleAccount } = await getCurrentUserGoogleAccount();
      const gmail = createGoogleGmailClient(googleAccount);

      const message = [
        `To: ${to}`,
        `Subject: ${subject}`,
        "Content-Type: text/plain; charset=utf-8",
        "",
        body,
      ].join("\n");

      const encodedMessage = Buffer.from(message).toString("base64url");

      await gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: encodedMessage,
        },
      });
      return `✅ Email sent successfully to ${to} with subject "${subject}".`;
    } catch (error: any) {
      return handleGoogleError(error, "send email");
    }
  },
});
