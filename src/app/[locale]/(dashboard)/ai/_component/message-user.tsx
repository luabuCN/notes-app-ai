"use client"

import {
  MessageAction,
  MessageActions,
  Message as MessageContainer,
  MessageContent,
} from "@/components/ui/message"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRef, useState } from "react"
import { Check, Copy, Pencil, Trash } from "lucide-react"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { useSession } from "@/lib/auth-client"
import { FileDisplayItem } from "./file-display-item"

export type MessageUserProps = {
  hasScrollAnchor?: boolean
  children: string
  copied: boolean
  copyToClipboard: () => void
  onEdit: (id: string, newText: string) => void
  onReload: () => void
  onDelete: (id: string) => void
  id: string
  className?: string
  parts?: any[]
}

export function MessageUser({
  hasScrollAnchor,
  children,
  copied,
  copyToClipboard,
  onEdit,
  onReload,
  onDelete,
  id,
  className,
  parts,
}: MessageUserProps) {
  const [editInput, setEditInput] = useState(children)
  const [isEditing, setIsEditing] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const { data } = useSession();
  const user = data?.user;
  
  // 过滤出文件类型的 parts
  const fileParts = parts?.filter((part) => part.type === "file") || []

  const handleEditCancel = () => {
    setIsEditing(false)
    setEditInput(children)
  }

  const handleSave = () => {
    if (onEdit) {
      onEdit(id, editInput)
    }
    onReload()
    setIsEditing(false)
  }

  const handleDelete = () => {
    onDelete(id)
  }

  return (
    <div className="w-full flex justify-center">
      <MessageContainer
        className={cn(
          "group flex w-full max-w-6xl flex-col items-end gap-0.5 px-6 pb-2",
          hasScrollAnchor && "min-h-scroll-anchor",
          className
        )}
      >
        {fileParts.length > 0 && (
          <div className="flex flex-wrap justify-end gap-2 mb-2 max-w-[70%]">
            {fileParts.map((part, index) => {
              // FileUIPart 可能的结构：
              // - part.data (base64 data URL)
              // - part.url
              // - part.filename
              // - part.name
              // - part.mimeType
              const fileUrl = part.data || part.url || ""
              const fileName = part.filename || part.name
              const fileMimeType = part.mimeType
              
              return (
                <FileDisplayItem
                  key={index}
                  url={fileUrl}
                  name={fileName}
                  mimeType={fileMimeType}
                />
              )
            })}
          </div>
        )}

        {isEditing ? (
          <div
            className="bg-accent relative flex min-w-[180px] flex-col gap-2 rounded-3xl px-5 py-2.5"
            style={{
              width: contentRef.current?.offsetWidth,
            }}
          >
            <textarea
              className="w-full resize-none bg-transparent outline-none"
              value={editInput}
              onChange={(e) => setEditInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSave()
                }
                if (e.key === "Escape") {
                  handleEditCancel()
                }
              }}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={handleEditCancel}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <MessageContent
            className="bg-accent relative max-w-[70%] rounded-3xl px-5 py-2.5"
            markdown={true}
            ref={contentRef}
          >
            {children}
          </MessageContent>
        )}
        <MessageActions className="flex gap-0 opacity-0 transition-opacity duration-0 group-hover:opacity-100">
          <MessageAction tooltip={copied ? "Copied!" : "Copy text"} side="bottom">
            <button
              className="hover:bg-accent/60 text-muted-foreground hover:text-foreground flex size-7.5 items-center justify-center rounded-full bg-transparent transition"
              aria-label="Copy text"
              onClick={copyToClipboard}
              type="button"
            >
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
            </button>
          </MessageAction>
          {/* @todo: add when ready */}
          <MessageAction
          tooltip={isEditing ? "Save" : "Edit"}
          side="bottom"
          delayDuration={0}
        >
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full bg-transparent transition"
            aria-label="Edit"
            onClick={() => setIsEditing(!isEditing)}
            type="button"
          >
            <Pencil className="size-4" />
          </button>
        </MessageAction>
          <MessageAction tooltip="Delete" side="bottom">
            <button
              className="hover:bg-accent/60 text-muted-foreground hover:text-foreground flex size-7.5 items-center justify-center rounded-full bg-transparent transition"
              aria-label="Delete"
              onClick={handleDelete}
              type="button"
            >
              <Trash className="size-4" />
            </button>
          </MessageAction>
        </MessageActions>
      </MessageContainer>
      {user?.image && <Avatar className="h-10 w-10 mt-[2px]">
        <AvatarImage
          src={user?.image ?? undefined}
          alt={user?.name ?? undefined}
        />
      </Avatar>}
    </div>
  )
}
