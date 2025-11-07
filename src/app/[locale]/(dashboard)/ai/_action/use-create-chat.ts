"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";

type ConversationWithMessages = {
  title: string | null;
  userId: string;
};

export async function createChat(chatData: ConversationWithMessages) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error("未登录");
  }
  if(session.user.id !== chatData.userId){
    throw new Error("无权限");
  }
  try {
    const conversation = await prisma.conversation.create({
      data: {
        title: chatData.title,
        userId: chatData.userId,
      },
    });
    return conversation;
  } catch (error) {
    console.error(error);
    throw new Error("创建对话失败");
  }
}
