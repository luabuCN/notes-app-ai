"use client"

import {
  ChatContainerContent,
  ChatContainerRoot,
} from "@/components/ui/chat-container"
import { Loader } from "@/components/ui/loader"
import { ScrollButton } from "@/components/ui/scroll-button"
import type { UIMessage } from "@ai-sdk/react"
import { useEffect, useRef } from "react"
import { Message } from "./message"

type ConversationProps = {
  messages: UIMessage[]
  status?: "streaming" | "ready" | "submitted" | "error"
  onDelete: (id: string) => void
  onEdit: (id: string, newText: string) => void
  onregenerate: () => void
}

export function Conversation({
  messages,
  status = "ready",
  onDelete,
  onregenerate,
}: ConversationProps) {
  const initialMessageCount = useRef(messages.length)
  if (!messages || messages.length === 0) return <></>
  return (
    <div className="relative flex flex-1 min-h-0 w-full flex-col items-center overflow-x-hidden overflow-y-auto pt-6 pb-32">
      <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 mx-auto flex w-full flex-col justify-center">
        <div className="h-app-header bg-background flex w-full lg:hidden lg:h-0" />
        <div className="h-app-header bg-background flex w-full mask-b-from-4% mask-b-to-100% lg:hidden" />
      </div>
      <ChatContainerRoot className="relative w-full">
        <ChatContainerContent
          className="flex w-full flex-col items-center pt-20"
          style={{
            scrollbarGutter: "stable both-edges",
            scrollbarWidth: "none",
          }}
        >
          {messages?.map((message, index) => {
            const isLast =
              index === messages.length - 1 && status !== "submitted"
            const hasScrollAnchor =
              isLast && messages.length > initialMessageCount.current

            return (
              <Message
                key={message.id}
                id={message.id}
                variant={message.role}
                isLast={isLast}
                onDelete={onDelete}
                onReload={onregenerate}
                hasScrollAnchor={hasScrollAnchor}
                parts={message.parts}
                status={status}
              >
                {(() => {
                  const textPart = message.parts?.find((part: any) => part.type === "text") as any;
                  return textPart?.text || "";
                })()}
              </Message>
            )
          })}
          {status === "submitted" &&
            messages.length > 0 &&
            messages[messages.length - 1].role === "user" && (
              <div
                className="group min-h-scroll-anchor flex w-full max-w-6xl flex-col items-start gap-2 px-6 pb-2">
                <Loader />
              </div>
            )}
          <div className="absolute bottom-0 flex w-full max-w-3xl flex-1 items-end justify-end gap-4 px-6 pb-2">
            <ScrollButton className="absolute top-[-50px] right-[30px]" />
          </div>
        </ChatContainerContent>
      </ChatContainerRoot>
    </div>
  )
}
