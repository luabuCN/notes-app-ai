"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";

export async function updateChat(chatId: string, title: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error("未登录");
  }
  const chat = await prisma.conversation.findUnique({ where: { id: chatId } });
  if(!chat) {
    throw new Error("未找到该会话");
  }
  try {
    await prisma.conversation.update({
      where: {
        id: chatId,
      },
      data: {
        title: title,
      },
    });
    return { success: true };
  } catch (error) {
    console.error(error);
    throw new Error("更新失败");
  }
}
