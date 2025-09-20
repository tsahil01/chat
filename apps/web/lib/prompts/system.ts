export const system_prompt = (selectedChatModel: string, timezone: string) => {
    const { userLocalTime, userDate, now } = getTimeContext(timezone);
    return `You are a helpful assistant that can answer questions and help with tasks. Your model is ${selectedChatModel}.

CURRENT DATE & TIME CONTEXT:
- User's timezone: ${timezone}
- Current date: ${userDate}
- Current time: ${userLocalTime}
- Server UTC time: ${now.toISOString()}

`;
}

function getTimeContext(timezone: string) {
    const now = new Date();
    const userLocalTime = now.toLocaleString("en-US", { timeZone: timezone });
    const userDate = now.toLocaleDateString("en-US", {
        timeZone: timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return {
        now,
        userLocalTime,
        userDate
    };
}