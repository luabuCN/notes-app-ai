import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createDeepSeek } from '@ai-sdk/deepseek';
import {  streamText, type ToolSet ,convertToModelMessages, stepCountIs, type UIMessage} from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import type { NextRequest } from "next/server";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  console.log(messages,'messages------');
  
  // 获取用户会话
  const session = await auth.api.getSession({ headers: req.headers });
  
  // 获取用户的模型配置
  let model;
  if (session?.user?.id) {
    const config = await prisma.aiModelConfig.findFirst({
      where: { userId: session.user.id, isActive: true },
      orderBy: { updatedAt: "desc" },
    });

    if (config) {
      const { provider, apiKey, modelName, baseURL } = config;
      
      switch (provider) {
        case "openai": {
          const openai = createOpenAI({
            apiKey,
            ...(baseURL ? { baseURL } : {}),
          });
          model = openai(modelName);
          break;
        }
        case "gemini": {
          const google = createGoogleGenerativeAI({
            apiKey,
            ...(baseURL ? { baseURL } : {}),
          });
          model = google(modelName);
          break;
        }
        case "deepseek": {
          const deepseek = createDeepSeek({
            apiKey,
            ...(baseURL ? { baseURL } : {}),
          });
          model = deepseek(modelName);
          break;
        }
        case "openrouter": {
          const openrouter = createOpenRouter({
            apiKey,
            ...(baseURL ? { baseURL } : {}),
          });
          model = openrouter(modelName);
          break;
        }
      }
    }
  }

  // 如果没有配置，使用默认的 DeepSeek
  if (!model) {
    const deepseek = createDeepSeek({
      apiKey: "sk-18c1c0a82f1b44b4936e7e0b0da2ae08",
    });
    model = deepseek("deepseek-chat");
  }

  const result = streamText({
    model,
    messages:convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {} as ToolSet,
    providerOptions: {
     google: {
      thinkingConfig:{
        thinkingBudget: 1024,
        includeThoughts: true,
      }
     }
    }
  });
  return result.toUIMessageStreamResponse({
    sendReasoning: true,
  });
}
