"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";

type DrawGroup = {
    name: string
}

export async function createDrawGroup({ name }: DrawGroup) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        throw new Error("未登录");
    }
    await prisma.excalidrawGroup.create({
        data: {
            userId: session.user.id,
            name,
        }
    })
}
