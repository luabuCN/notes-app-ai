"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";

export async function getDrawDetail(id: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        throw new Error("未登录");
    }

    return await prisma.excalidraw.findUnique({
        where: {
            id: id,
        },
        select: {
            id: true,
            title: true,
            emoji: true,
            version:true,
            groupId: true,
            data: true,
            updatedAt:true,
        }
    })
}
