"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { Message } from "@prisma/client";

export async function saveMessages(conversationId: string, messages: Message[]) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error("未登录");
  }

  // 验证会话归属
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId: session.user.id,
    },
  });

  if (!conversation) {
    throw new Error("无权限访问该对话");
  }

  try {
    await prisma.message.deleteMany({
      where: { conversationId },
    });

    const savedMessages = await prisma.$transaction(
      messages.map((msg) =>
        prisma.message.create({
          data: {
            id: msg.id, // 保留原来的 id
            role: msg.role,
            parts: msg.parts || {},
            metadata: msg.metadata || {},
            createdAt: msg.createdAt || new Date(), // 保留原时间或当前时间
            conversationId,
          },
        })
      )
    );

    // ✅ 更新会话的更新时间
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return {
      messages: savedMessages.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      ),
    };
  } catch (error: any) {
    console.error("批量保存消息时出错:", error);
    throw new Error("批量保存消息失败：" + (error?.message || error));
  }
}
