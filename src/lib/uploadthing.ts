import type { FileRouter } from 'uploadthing/next';
import { createUploadthing } from 'uploadthing/next';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/db";

const f = createUploadthing();

export const ourFileRouter = {
  editorUploader: f(['image', 'text', 'blob', 'pdf', 'video', 'audio'])
    .middleware( async () => {
      const session = await auth.api.getSession({
        headers: await headers()
      })
      if (!session) {
        throw new Error("未登录");
      }

      return { userId : session.user.id}
    })
    .onUploadComplete(async ({ metadata, file }) => {
      
      await prisma.file.create({
        data: {
          url: file.ufsUrl,
          name: file.name,
          userId: metadata.userId,
        }
      });
      
      return {
        key: file.key,
        name: file.name, 
        size: file.size,
        type: file.type,
        url: file.ufsUrl,
        uploadedBy: metadata.userId,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
