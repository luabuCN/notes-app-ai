"use client"

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import Image from "next/image"
import { useState } from "react"

type FileDisplayItemProps = {
  url: string
  name?: string
  mimeType?: string
}

export function FileDisplayItem({ url, name, mimeType }: FileDisplayItemProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  if (!url) {
    return null
  }

  const isBase64 = url.startsWith("data:")
  const actualUrl = url
  let actualMimeType = mimeType
  let fileName = name
  
  // 如果是 base64，从 data URL 中提取 MIME 类型
  if (isBase64) {
    const match = url.match(/^data:([^;]+);/)
    if (match) {
      actualMimeType = match[1]
    }
    // 如果没有提供文件名，根据 MIME 类型生成默认文件名
    if (!fileName) {
      const extension = actualMimeType?.split("/")[1] || "file"
      fileName = `file.${extension}`
    }
  } else {
    // 普通 URL，从 URL 中提取文件名
    fileName = name || url.split("/").pop()?.split("?")[0] || "文件"
  }
  
  const fileExtension = fileName.split(".").pop()?.toUpperCase() || ""
  const isImage = actualMimeType?.includes("image") || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName)

  return (
    <div className="relative mr-2 mb-0 flex items-center">
      <HoverCard
        open={isImage ? isOpen : false}
        onOpenChange={setIsOpen}
      >
        <HoverCardTrigger className="w-full">
          <div className="bg-background hover:bg-accent border-input flex w-full items-center gap-3 rounded-2xl border p-2 pr-3 transition-colors">
            <div className="bg-accent-foreground relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-md">
              {isImage ? (
                <Image
                  src={actualUrl}
                  alt={fileName}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="text-center text-xs text-gray-400">
                  {fileExtension}
                </div>
              )}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-xs font-medium">{fileName}</span>
            </div>
          </div>
        </HoverCardTrigger>
        {isImage && (
          <HoverCardContent side="top">
            <Image
              src={actualUrl}
              alt={fileName}
              width={200}
              height={200}
              className="h-full w-full object-cover"
              unoptimized
            />
          </HoverCardContent>
        )}
      </HoverCard>
    </div>
  )
}

