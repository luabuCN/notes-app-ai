"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";

type UpdateGroupData = {
    name: string;
    id: string;
}

export async function updateDrawGroup(groupData: UpdateGroupData) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        throw new Error("未登录");
    }
    await prisma.excalidrawGroup.update({
        where: {
            id: groupData.id
        },
        data: {
            name: groupData.name,
        }
    })
}
