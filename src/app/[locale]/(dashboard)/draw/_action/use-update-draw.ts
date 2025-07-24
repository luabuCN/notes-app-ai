"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";

type UpdateDrawData = {
    title: string;
    id: string;
    emoji: string;
}

export async function updateDraw(drawData: UpdateDrawData) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        throw new Error("未登录");
    }
    await prisma.excalidraw.update({
        where: {
            id: drawData.id
        },
        data: {
            title: drawData.title,
            emoji: drawData.emoji,
        }
    })
}
