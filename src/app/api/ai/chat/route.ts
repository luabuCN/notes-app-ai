import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createDeepSeek } from '@ai-sdk/deepseek';
import {  streamText, type ToolSet ,convertToModelMessages, stepCountIs, type UIMessage} from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  console.log(messages,'messages------');
 
  // const deepseek = createDeepSeek({
  //   apiKey: "sk-18c1c0a82f1b44b4936e7e0b0da2ae08",
  // });

  const google = createGoogleGenerativeAI({
    apiKey:'AIzaSyAkZDLI4mvrYmFyDEtbNrlwOl2WMJp6Z1g'
  });

  // const openrouter = createOpenRouter({
  //   apiKey: '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',
  // });


  const result = streamText({
    // model: deepseek("deepseek-chat"),
    model: google("gemini-2.5-flash"),
    // model: openrouter("openai/gpt-oss-20b:free"),
    messages:convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {} as ToolSet,
  });

  return result.toUIMessageStreamResponse();
}
