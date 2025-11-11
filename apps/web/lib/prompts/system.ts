import { personalities, Personality } from "./personality";
import { Integration } from "@workspace/db";

function getPersonality(personalityName?: string): Personality | undefined {
  return personalities.find(
    (p) => p.name.toLowerCase() === personalityName?.toLowerCase()
  );
}

function integrationPrompt(integrations: Integration[]) {
  return `Integration allows you to access data & services from external sources. You can use the integration via tools.
Following are the integrations you have access to:
- Github (requires integration with Github, user needs to link their Github account)
- Google (requires integration with Google, user needs to link their Google account)
Enabled integrations:
${integrations
  .map((integration) => {
    return `- ${integration.name}`;
  })
  .join("\n")}
If there is not tool available for the integration, you need to inform the user that the integration is not available or not linked.
`;
}

export const system_prompt = (
  selectedChatModel: string,
  timezone: string,
  personalityName?: string,
  integrations: Integration[] = []
) => {
  const { userLocalTime, userDate, now } = getTimeContext(timezone);
  const personality = getPersonality(personalityName);

  return `You are a helpful assistant that can answer questions and help with tasks. Your model is ${selectedChatModel}.

${integrationPrompt(integrations)}\n

${personality ? `Your personality is: ${personality.name.charAt(0).toUpperCase() + personality.name.slice(1)}\n${personality.instructions}\n` : ""}

CURRENT DATE & TIME CONTEXT:
- User's timezone: ${timezone}
- Current date: ${userDate}
- Current time: ${userLocalTime}
- Server UTC time: ${now.toISOString()}
`;
};

function getTimeContext(timezone: string) {
  const now = new Date();
  const userLocalTime = now.toLocaleString("en-US", { timeZone: timezone });
  const userDate = now.toLocaleDateString("en-US", {
    timeZone: timezone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return {
    now,
    userLocalTime,
    userDate,
  };
}
