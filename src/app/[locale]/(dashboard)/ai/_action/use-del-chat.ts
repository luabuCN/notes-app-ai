"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";

export async function delChat(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error("未登录");
  }

  try {
    // 验证当前用户
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!conversation) {
      throw new Error("对话不存在或无权限删除");
    }

    // 删除对话
    await prisma.conversation.delete({
      where: {
        id: id,
      },
    });

    return { success: true };

  } catch (error) {
    console.error(error);
    throw new Error("删除对话失败");
  }
}
