"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";

export async function getAllDrawGroups() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        throw new Error("未登录");
    }

    const groups = await prisma.excalidrawGroup.findMany({
        where: {
            userId: session.user.id,
            isDeleted: false,
        },
        include: {
            excalidraws: {
                orderBy: {
                    createdAt: "desc",
                },
                where: {
                    isDeleted: false,
                }
            },
        },
        orderBy: {
            createdAt: "desc"
        }
    })
    return groups.map(({ excalidraws, ...rest }) => ({
        ...rest,
        whiteboards: excalidraws,
        isExpanded: false, // 默认展开
    }));
}
