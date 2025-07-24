"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";

type Draw = {
    title: string
    emoji: string
    groupId: string
    data: any
}

export async function createDraw({ title, emoji, groupId, data }: Draw) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        throw new Error("未登录");
    }
    await prisma.excalidraw.create({
        data: {
            title,
            emoji,
            groupId,
            data,
            userId: session.user.id,
        }
    })
}
