"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";

type SaveDrawData = {
    id: string;
    data: any;
}
export async function saveDrawData({id,data}:SaveDrawData) {
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
            data
        }
    })
}
