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
   const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: session.user.id,
      },
    });

    if (!conversation) {
       throw new Error("无权限"); 
    }

    //批量保存信息
    const savedMessages = await Promise.all(
      messages.map((msg: any) =>
        prisma.message.upsert({
          where: { id: msg.id },
          update: {
            content: msg.content,
            parts: msg.parts || {},
          },
          create: {
            id: msg.id,
            role: msg.role,
            content: msg.content,
            parts: msg.parts || {},
            conversationId,
          },
        })
      )
    )
    
    return {
        messages : savedMessages
    }
}