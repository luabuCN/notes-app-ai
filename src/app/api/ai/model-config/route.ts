import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import type { ModelConfig } from "@/lib/types/model-config";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const config = await prisma.aiModelConfig.findUnique({
      where: { userId: session.user.id },
    });

    if (!config) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: config.id,
      provider: config.provider,
      apiKey: config.apiKey,
      modelName: config.modelName,
      baseURL: config.baseURL,
    } as ModelConfig);
  } catch (error) {
    console.error("Error fetching model config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { provider, apiKey, modelName, baseURL } = body;

    if (!provider || !apiKey || !modelName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 检查是否已存在配置
    const existing = await prisma.aiModelConfig.findUnique({
      where: { userId: session.user.id },
    });

    let config;
    if (existing) {
      // 更新现有配置
      config = await prisma.aiModelConfig.update({
        where: { userId: session.user.id },
        data: {
          provider,
          apiKey,
          modelName,
          baseURL: baseURL || null,
        },
      });
    } else {
      // 创建新配置
      config = await prisma.aiModelConfig.create({
        data: {
          userId: session.user.id,
          provider,
          apiKey,
          modelName,
          baseURL: baseURL || null,
        },
      });
    }

    return NextResponse.json({
      id: config.id,
      provider: config.provider,
      apiKey: config.apiKey,
      modelName: config.modelName,
      baseURL: config.baseURL,
    } as ModelConfig);
  } catch (error) {
    console.error("Error saving model config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

