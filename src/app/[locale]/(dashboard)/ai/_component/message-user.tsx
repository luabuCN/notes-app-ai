"use client";

import {
  MessageAction,
  MessageActions,
  Message as MessageContainer,
  MessageContent,
} from "@/components/ui/message";
import { cn } from "@/lib/utils";
import { useRef } from "react";
import { Check, Copy, Trash } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/lib/auth-client";
import { FileDisplayItem } from "./file-display-item";

export type MessageUserProps = {
  hasScrollAnchor?: boolean;
  children: string;
  copied: boolean;
  copyToClipboard: () => void;
  onDelete: (id: string) => void;
  id: string;
  className?: string;
  parts?: any[];
};

export function MessageUser({
  hasScrollAnchor,
  children,
  copied,
  copyToClipboard,
  onDelete,
  id,
  className,
  parts,
}: MessageUserProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { data } = useSession();
  const user = data?.user;

  // 过滤出文件类型的 parts
  const fileParts = parts?.filter((part) => part.type === "file") || [];

  const handleDelete = () => {
    onDelete(id);
  };

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
              const fileUrl = part.data || part.url || "";
              const fileName = part.filename || part.name;
              const fileMimeType = part.mimeType;

              return (
                <FileDisplayItem
                  key={index}
                  url={fileUrl}
                  name={fileName}
                  mimeType={fileMimeType}
                />
              );
            })}
          </div>
        )}

          <MessageContent
            className="bg-accent relative max-w-[70%] rounded-3xl px-5 py-2.5"
            markdown={true}
            ref={contentRef}
          >
            {children}
          </MessageContent>
        <MessageActions className="flex gap-0 opacity-0 transition-opacity duration-0 group-hover:opacity-100">
          <MessageAction
            tooltip={copied ? "Copied!" : "Copy text"}
            side="bottom"
          >
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
      {user?.image && (
        <Avatar className="h-10 w-10 mt-[2px]">
          <AvatarImage
            src={user?.image ?? undefined}
            alt={user?.name ?? undefined}
          />
        </Avatar>
      )}
    </div>
  );
}
