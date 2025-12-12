import { tool } from "ai";
import {
  handleGoogleError,
  getCurrentUserGoogleAccount,
  createGoogleGmailClient,
} from "./utils";
import { z } from "zod";

export const listEmails = tool({
  description: "List recent emails from the user's inbox",
  inputSchema: z.object({
    maxResults: z
      .number()
      .default(10)
      .describe("Maximum number of emails to return (default 10)"),
  }),
  execute: async ({ maxResults }) => {
    try {
      const { googleAccount } = await getCurrentUserGoogleAccount();
      const gmail = createGoogleGmailClient(googleAccount);

      const response = await gmail.users.messages.list({
        userId: "me",
        maxResults,
        labelIds: ["INBOX"],
      });

      const messages = response.data.messages || [];
      
      if (messages.length === 0) {
        return "📧 No emails found in your inbox.";
      }

      const emailDetails = await Promise.all(
        messages.slice(0, Math.min(5, messages.length)).map(async (msg) => {
          const detail = await gmail.users.messages.get({
            userId: "me",
            id: msg.id!,
            format: "metadata",
            metadataHeaders: ["From", "Subject", "Date"],
          });
          
          const headers = detail.data.payload?.headers || [];
          const from = headers.find((h) => h.name === "From")?.value || "Unknown";
          const subject = headers.find((h) => h.name === "Subject")?.value || "(No subject)";
          const date = headers.find((h) => h.name === "Date")?.value || "";
          
          return `• From: ${from}\n  Subject: ${subject}\n  Date: ${date}\n  ID: ${msg.id}`;
        })
      );

      return `📧 Found ${messages.length} emails in inbox. Showing first ${emailDetails.length}:\n\n${emailDetails.join("\n\n")}`;
    } catch (error: any) {
      return handleGoogleError(error, "list emails");
    }
  },
});

export const getEmail = tool({
  description: "Get full details of a specific email by its ID",
  inputSchema: z.object({
    emailId: z.string().describe("Email ID to retrieve"),
  }),
  execute: async ({ emailId }) => {
    try {
      const { googleAccount } = await getCurrentUserGoogleAccount();
      const gmail = createGoogleGmailClient(googleAccount);
      
      const email = await gmail.users.messages.get({
        userId: "me",
        id: emailId,
        format: "full",
      });

      const headers = email.data.payload?.headers || [];
      const from = headers.find((h) => h.name === "From")?.value || "Unknown";
      const to = headers.find((h) => h.name === "To")?.value || "Unknown";
      const subject = headers.find((h) => h.name === "Subject")?.value || "(No subject)";
      const date = headers.find((h) => h.name === "Date")?.value || "";
      
      let body = "";
      if (email.data.payload?.parts) {
        const textPart = email.data.payload.parts.find(
          (part) => part.mimeType === "text/plain"
        );
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
        }
      } else if (email.data.payload?.body?.data) {
        body = Buffer.from(email.data.payload.body.data, "base64").toString("utf-8");
      }

      return `📧 Email Details:\n\nFrom: ${from}\nTo: ${to}\nSubject: ${subject}\nDate: ${date}\n\n--- Message Body ---\n${body.slice(0, 1000)}${body.length > 1000 ? "\n\n[Message truncated...]" : ""}`;
    } catch (error: any) {
      return handleGoogleError(error, "get email");
    }
  },
});

export const searchEmails = tool({
  description: "Search emails using Gmail search syntax (e.g., 'from:someone@example.com', 'subject:meeting', 'after:2024/01/01')",
  inputSchema: z.object({
    query: z.string().describe("Gmail search query (supports operators like from:, to:, subject:, after:, before:)"),
    maxResults: z.number().default(10).optional().describe("Maximum number of results to return"),
  }),
  execute: async ({ query, maxResults = 10 }) => {
    try {
      const { googleAccount } = await getCurrentUserGoogleAccount();
      const gmail = createGoogleGmailClient(googleAccount);
      
      const response = await gmail.users.messages.list({
        userId: "me",
        q: query,
        maxResults,
      });

      const messages = response.data.messages || [];
      
      if (messages.length === 0) {
        return `🔍 No emails found matching query: "${query}"`;
      }

      const emailDetails = await Promise.all(
        messages.slice(0, Math.min(5, messages.length)).map(async (msg) => {
          const detail = await gmail.users.messages.get({
            userId: "me",
            id: msg.id!,
            format: "metadata",
            metadataHeaders: ["From", "Subject", "Date"],
          });
          
          const headers = detail.data.payload?.headers || [];
          const from = headers.find((h) => h.name === "From")?.value || "Unknown";
          const subject = headers.find((h) => h.name === "Subject")?.value || "(No subject)";
          const date = headers.find((h) => h.name === "Date")?.value || "";
          
          return `• From: ${from}\n  Subject: ${subject}\n  Date: ${date}\n  ID: ${msg.id}`;
        })
      );

      return `🔍 Found ${messages.length} emails matching "${query}". Showing first ${emailDetails.length}:\n\n${emailDetails.join("\n\n")}`;
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
