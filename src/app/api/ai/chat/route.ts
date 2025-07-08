import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import z from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const openai = createOpenAI({
    apiKey:process.env.OPENAI_API_KEY,
    baseURL: "https://api.chatanywhere.tech",
  });
  // const openai = createOpenAI({
  //   apiKey:'sk-DVtXLOow5mga5ut90k7NlCNXFshOwzJdRPD0dvRauU1yBckA',
  //   baseURL: "https://api.poixe.com",
  // });

  const result = streamText({
    // model: openai('gpt-4o'),
    model: openai('deepseek/deepseek-r1-0528:free'),
    messages,
    tools: {
      weather: tool({
        description: 'Get the weather in a location (fahrenheit)',
        parameters: z.object({
          location: z.string().describe('The location to get the weather for'),
        }),
        execute: async ({ location }) => {
          const temperature = Math.round(Math.random() * (90 - 32) + 32);
          return {
            location,
            temperature,
          };
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}