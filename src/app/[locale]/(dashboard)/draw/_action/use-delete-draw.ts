"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";

export async function deleteDraw(id: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        throw new Error("未登录");
    }

    await prisma.excalidraw.update({
        where: {
            id: id,
        },
        data: {
            isDeleted: true,
        },
    })
}
