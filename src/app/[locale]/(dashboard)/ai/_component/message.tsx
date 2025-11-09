"use client";

import { UIMessage } from "@ai-sdk/react";
import React, { useState } from "react";
import { MessageAssistant } from "./message-assistant";
import { MessageUser } from "./message-user";

type MessageProps = {
  variant: UIMessage["role"];
  children: string;
  id: string;
  isLast?: boolean;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
  onReload: () => void;
  hasScrollAnchor?: boolean;
  parts?: any[];
  status?: "streaming" | "ready" | "submitted" | "error";
  className?: string;
};

function MessageInner({
  variant,
  children,
  id,
  isLast,
  onDelete,
  onEdit,
  onReload,
  hasScrollAnchor,
  parts,
  status,
  className,
}: MessageProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const textContent = parts?.find(part => part.type === "text")?.text || children;
    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 500);
  };

  if (variant === "user") {
    return (
      <MessageUser
        copied={copied}
        copyToClipboard={copyToClipboard}
        onReload={onReload}
        onEdit={onEdit}
        onDelete={onDelete}
        id={id}
        hasScrollAnchor={hasScrollAnchor}
        className={className}
        parts={parts}
      >
        {children}
      </MessageUser>
    );
  }

  if (variant === "assistant" || status === "error") {
    return (
      <MessageAssistant
        copied={copied}
        copyToClipboard={copyToClipboard}
        onReload={onReload}
        isLast={isLast}
        hasScrollAnchor={hasScrollAnchor}
        parts={parts}
        status={status}
        className={className}
      >
        {children}
      </MessageAssistant>
    );
  }

  return null;
}

export const Message = React.memo(MessageInner, (prev, next) => {
  return (
    prev.id === next.id &&
    prev.variant === next.variant &&
    prev.children === next.children &&
    prev.status === next.status &&
    prev.isLast === next.isLast
  );
});
