import { tool } from "ai";
import { z } from "zod";
import {
  getCurrentUserGoogleAccount,
  createGoogleCalendarClient,
  handleGoogleError,
  createGoogleGmailClient,
} from "./utils";

export const createCalendarEvent = tool({
  description: "Create a new Google Calendar event",
  inputSchema: z.object({
    title: z.string().describe("Event title/summary"),
    startTime: z
      .string()
      .describe("Start time in ISO format (e.g., 2024-01-20T10:00:00Z)"),
    endTime: z
      .string()
      .describe("End time in ISO format (e.g., 2024-01-20T11:00:00Z)"),
    description: z.string().optional().describe("Event description"),
    location: z.string().optional().describe("Event location"),
  }),
  execute: async ({ title, startTime, endTime, description, location }) => {
    try {
      const { googleAccount } = await getCurrentUserGoogleAccount();
      const calendar = createGoogleCalendarClient(googleAccount);

      // Create the event
      const event = await calendar.events.insert({
        calendarId: "primary",
        requestBody: {
          summary: title,
          start: { dateTime: startTime },
          end: { dateTime: endTime },
          description,
          location,
        },
      });

      return `✅ Event created successfully: "${title}" on ${new Date(startTime).toLocaleDateString()} at ${new Date(startTime).toLocaleTimeString()}. View it here: ${event.data.htmlLink}`;
    } catch (error: any) {
      return handleGoogleError(error, "create calendar event");
    }
  },
});

export const deleteCalendarEvent = tool({
  description: "Delete a Google Calendar event",
  inputSchema: z.object({
    eventId: z.string().describe("Event ID"),
  }),
  execute: async ({ eventId }) => {
    try {
      const { googleAccount } = await getCurrentUserGoogleAccount();
      const calendar = createGoogleCalendarClient(googleAccount);
      await calendar.events.delete({
        calendarId: "primary",
        eventId,
      });
      return `✅ Event deleted successfully: "${eventId}".`;
    } catch (error: any) {
      return handleGoogleError(error, "delete calendar event");
    }
  },
});

export const listCalendarEvents = tool({
  description: "List upcoming Google Calendar events",
  inputSchema: z.object({
    maxResults: z
      .number()
      .default(10)
      .describe("Maximum number of events to return"),
    timeMin: z.string().optional().describe("Start time filter in ISO format"),
    timeMax: z.string().optional().describe("End time filter in ISO format"),
  }),
  execute: async ({ maxResults, timeMin, timeMax }) => {
    try {
      const { googleAccount } = await getCurrentUserGoogleAccount();
      const calendar = createGoogleCalendarClient(googleAccount);

      const events = await calendar.events.list({
        calendarId: "primary",
        timeMin: timeMin || new Date().toISOString(),
        timeMax,
        maxResults,
        singleEvents: true,
        orderBy: "startTime",
      });

      const eventList =
        events.data.items?.map((event) => ({
          title: event.summary,
          start: event.start?.dateTime || event.start?.date,
          end: event.end?.dateTime || event.end?.date,
          location: event.location,
          description: event.description,
        })) || [];

      if (eventList.length === 0) {
        return "📅 No upcoming events found.";
      }

      return `📅 Upcoming events:\n${eventList
        .map(
          (event) =>
            `• ${event.title} - ${new Date(event.start!).toLocaleString()}${event.location ? ` at ${event.location}` : ""}`,
        )
        .join("\n")}`;
    } catch (error: any) {
      return handleGoogleError(error, "fetch calendar events");
    }
  },
});

export const checkCalendarAvailability = tool({
  description:
    "Check availability in Google Calendar for a specific time range",
  inputSchema: z.object({
    startTime: z.string().describe("Start time to check in ISO format"),
    endTime: z.string().describe("End time to check in ISO format"),
  }),
  execute: async ({ startTime, endTime }) => {
    try {
      const { googleAccount } = await getCurrentUserGoogleAccount();
      const calendar = createGoogleCalendarClient(googleAccount);

      const events = await calendar.events.list({
        calendarId: "primary",
        timeMin: startTime,
        timeMax: endTime,
        singleEvents: true,
        orderBy: "startTime",
      });

      const conflictingEvents = events.data.items || [];

      if (conflictingEvents.length === 0) {
        return `✅ You're available from ${new Date(startTime).toLocaleString()} to ${new Date(endTime).toLocaleString()}`;
      } else {
        return `❌ You have ${conflictingEvents.length} conflicting event(s):\n${conflictingEvents
          .map(
            (event) =>
              `• ${event.summary} - ${new Date(event.start?.dateTime || event.start?.date!).toLocaleString()}`,
          )
          .join("\n")}`;
      }
    } catch (error: any) {
      return handleGoogleError(error, "check availability");
    }
  },
});
