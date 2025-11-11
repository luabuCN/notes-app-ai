import type { NextRequest } from "next/server";

import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  const {
    prompt,
    system,
  } = await req.json();

  // 获取用户会话
  const session = await auth.api.getSession({ headers: req.headers });
  
  // 获取用户的模型配置
  let model;
  if (session?.user?.id) {
    const config = await prisma.aiModelConfig.findUnique({
      where: { userId: session.user.id },
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

  if (!model) {
    const deepseek = createDeepSeek({
      apiKey: "sk-18c1c0a82f1b44b4936e7e0b0da2ae08",
    });
    model = deepseek("deepseek-chat");
  }

  try {
    const result = await generateText({
      abortSignal: req.signal,
      model,
      prompt: prompt,
      system,
      temperature: 0.7,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(null, { status: 408 });
    }

    return NextResponse.json(
      { error: "Failed to process AI request" },
      { status: 500 }
    );
  }
}
