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

    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all");
    const provider = searchParams.get("provider");

    // 返回全部列表
    if (all === "1" || all === "true") {
      const list = await prisma.aiModelConfig.findMany({
        where: { userId: session.user.id },
        orderBy: [{ updatedAt: "desc" }],
      });
      return NextResponse.json(list.map((c) => ({
        id: c.id,
        provider: c.provider,
        apiKey: c.apiKey,
        modelName: c.modelName,
        baseURL: c.baseURL,
        isActive: (c as any).isActive,
      })));
    }

    // 按供应商获取最近一次配置（用于切换时回显）
    if (provider) {
      const byProvider = await prisma.aiModelConfig.findFirst({
        where: { userId: session.user.id, provider },
        orderBy: { updatedAt: "desc" },
      });
      if (!byProvider) {
        return NextResponse.json(
          { error: "Not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({
        id: byProvider.id,
        provider: byProvider.provider,
        apiKey: byProvider.apiKey,
        modelName: byProvider.modelName,
        baseURL: byProvider.baseURL,
        isActive: (byProvider as any).isActive,
      } as Partial<ModelConfig> & { isActive?: boolean });
    }

    // 默认返回激活配置
    const config = await (prisma as any).aiModelConfig.findFirst({
      where: { userId: session.user.id, isActive: true },
      orderBy: { updatedAt: "desc" },
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
      isActive: (config as any).isActive,
    } as Partial<ModelConfig> & { isActive?: boolean });
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
    const { id, provider, apiKey, modelName, baseURL, activate } = body;

    if (!provider || !apiKey || !modelName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 同一用户下每个供应商仅保留一条配置
    const existingByProvider = await prisma.aiModelConfig.findFirst({
      where: { userId: session.user.id, provider },
    });

    // 兼容性：若请求携带 id，则确保该记录属于当前用户
    const existingById = id
      ? await prisma.aiModelConfig.findFirst({
          where: { id, userId: session.user.id },
        })
      : null;

    let config;
    if (existingByProvider) {
      config = await prisma.aiModelConfig.update({
        where: { id: existingByProvider.id },
        data: {
          apiKey,
          modelName,
          baseURL: baseURL || null,
        },
      });
    } else if (existingById) {
      config = await prisma.aiModelConfig.update({
        where: { id: existingById.id },
        data: {
          provider,
          apiKey,
          modelName,
          baseURL: baseURL || null,
        },
      });
    } else {
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

    // 激活逻辑：若 activate 为真，则将该用户其他配置置为未激活，当前置为激活
    if (activate === true) {
      await prisma.$transaction([
        (prisma as any).aiModelConfig.updateMany({
          where: { userId: session.user.id, NOT: { id: config.id } },
          data: { isActive: false },
        }),
        (prisma as any).aiModelConfig.update({
          where: { id: config.id },
          data: { isActive: true },
        }),
      ]);
      config = await prisma.aiModelConfig.findUnique({ where: { id: config.id } });
    }

    if (!config) {
      throw new Error("Config not found after save");
    }

    return NextResponse.json({
      id: config.id,
      provider: config.provider,
      apiKey: config.apiKey,
      modelName: config.modelName,
      baseURL: config.baseURL,
      isActive: (config as any).isActive,
    } as Partial<ModelConfig> & { isActive?: boolean });
  } catch (error) {
    console.error("Error saving model config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

