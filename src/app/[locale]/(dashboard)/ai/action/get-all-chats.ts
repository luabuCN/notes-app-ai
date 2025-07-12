"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";

export async function getAllChats(title?: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error("未登录");
  }

  const chats = await prisma.user.findFirst({
    where: {
      id: session.user.id
    },
    include: {
      conversations: {
        where: title ? {
          title: {
            contains: title,
            mode: 'insensitive'
          }
        } : {},
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  })
  return chats?.conversations
}
