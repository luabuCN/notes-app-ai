"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";

export async function deleteMessage(messageId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error("未登录");
  }

  try {
    // 查找消息并验证权限
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
      },
      include: {
        conversation: true,
      },
    });

    if (!message) {
      throw new Error("消息不存在");
    }

    // 验证消息所属的会话是否属于当前用户
    if (message.conversation.userId !== session.user.id) {
      throw new Error("无权限删除此消息");
    }

    // 删除消息
    await prisma.message.delete({
      where: {
        id: messageId,
      },
    });

    // 更新会话的更新时间
    await prisma.conversation.update({
      where: { id: message.conversationId },
      data: { updatedAt: new Date() },
    });

    return { success: true };
  } catch (error: any) {
    console.error("删除消息时出错:", error);
    throw new Error(error?.message || "删除消息失败");
  }
}

