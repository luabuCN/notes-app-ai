"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";

export async function getChatWithMessages(chatId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error("未登录");
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: chatId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" }, 
      },
    },
  });

  if (!conversation) {
    throw new Error("对话不存在");
  }

  if (conversation.userId !== session.user.id) {
    throw new Error("无权限访问此对话");
  }

  const formattedMessages = conversation.messages
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

  return {
    conversation,
    messages: formattedMessages,
  };
}
