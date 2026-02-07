import { streamText, convertToModelMessages, UIMessage, stepCountIs } from 'ai';
import { tools } from '@/ai/tools';

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  const result = streamText({
    model: "openai/o4-mini",
    system: 'You are a friendly assistant!',
    messages: await convertToModelMessages(messages),
    // Use tools defined in ai/tools.ts (generative UI tools)
    tools,
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}