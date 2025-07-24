"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";

export async function deleteDrawGroup(id: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        throw new Error("未登录");
    }

    await prisma.$transaction([
        prisma.excalidrawGroup.update({
            where: {
                id
            },
            data: {
                isDeleted: true,
            },
        }),

        prisma.excalidraw.updateMany({
            where: {
                groupId: id,
            },
            data: {
                isDeleted: true,
            },
        }),
    ]);
}
