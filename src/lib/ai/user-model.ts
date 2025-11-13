import { createDeepSeek } from '@ai-sdk/deepseek';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

type ModelConfig = NonNullable<
  Awaited<ReturnType<typeof prisma.aiModelConfig.findFirst>>
>;

type ResolveModelSuccess = {
  config: ModelConfig;
  errorResponse: null;
  model: LanguageModel;
  provider: ModelConfig['provider'];
};

type ResolveModelError = {
  config: null;
  errorResponse: NextResponse;
  model: null;
  provider: null;
};

export type ResolveModelResult = ResolveModelSuccess | ResolveModelError;

export async function resolveUserConfiguredModel(
  req: NextRequest
): Promise<ResolveModelResult> {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user?.id) {
    return {
      config: null,
      errorResponse: NextResponse.json(
        { error: '用户未登录或会话已失效。' },
        { status: 401 }
      ),
      model: null,
      provider: null,
    };
  }

  const config = await prisma.aiModelConfig.findFirst({
    where: { userId: session.user.id, isActive: true },
    orderBy: { updatedAt: 'desc' },
  });

  if (!config) {
    return {
      config: null,
      errorResponse: NextResponse.json(
        { error: '未找到可用的模型配置，请前往设置页面完成配置。' },
        { status: 400 }
      ),
      model: null,
      provider: null,
    };
  }

  const { provider, apiKey, modelName, baseURL } = config;

  if (!apiKey || !modelName) {
    return {
      config: null,
      errorResponse: NextResponse.json(
        { error: '模型配置不完整，请检查 API Key 与模型名称。' },
        { status: 400 }
      ),
      model: null,
      provider: null,
    };
  }

  const commonOptions = baseURL ? { apiKey, baseURL } : { apiKey };

  switch (provider) {
    case 'openai': {
      const openai = createOpenAI(commonOptions);
      return {
        config,
        errorResponse: null,
        model: openai(modelName),
        provider,
      };
    }
    case 'gemini': {
      const google = createGoogleGenerativeAI(commonOptions);
      return {
        config,
        errorResponse: null,
        model: google(modelName),
        provider,
      };
    }
    case 'deepseek': {
      const deepseek = createDeepSeek(commonOptions);
      return {
        config,
        errorResponse: null,
        model: deepseek(modelName),
        provider,
      };
    }
    case 'openrouter': {
      const openrouter = createOpenRouter(commonOptions);
      return {
        config,
        errorResponse: null,
        model: openrouter(modelName),
        provider,
      };
    }
    default: {
      return {
        config: null,
        errorResponse: NextResponse.json(
          { error: '暂不支持所选模型提供商，请重新配置。' },
          { status: 400 }
        ),
        model: null,
        provider: null,
      };
    }
  }
}

