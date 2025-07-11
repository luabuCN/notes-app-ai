import { createOpenAI } from '@ai-sdk/openai';
import { streamText, type ToolSet } from 'ai';


export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // const openai = createOpenAI({
  //   apiKey:process.env.OPENAI_API_KEY,
  //   baseURL: "https://api.chatanywhere.tech",
  // });
  const openai = createOpenAI({
    apiKey: 'sk-18c1c0a82f1b44b4936e7e0b0da2ae08',
    baseURL: "https://api.deepseek.com",
  });

  const result = streamText({
    // model: openai('gpt-4o'),
    model: openai('deepseek-chat'),
    maxSteps: 10,
    messages,
    tools: {} as ToolSet
  });

  return result.toDataStreamResponse(
    {
      sendReasoning: true,
      sendSources: true,
    }
  );
}