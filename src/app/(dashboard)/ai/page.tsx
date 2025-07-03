"use client"

import { useChat } from "@ai-sdk/react";
import { ChatInput } from "./component/chat-input";
import { Conversation } from "./component/conversation";
import { useCallback, useEffect, useMemo } from "react";

export default function AiPage() {
  const {
    messages,
    input,
    status,
    reload,
    setMessages,
    setInput,
    append,
  } = useChat({
    api: "/api/ai/chat",
  });
  const handleDelete = useCallback(
    (id: string) => {
      setMessages(messages.filter((message) => message.id !== id))
    },
    [messages, setMessages]
  )

  const handleEdit = useCallback(
    (id: string, newText: string) => {
      setMessages(
        messages.map((message) =>
          message.id === id ? { ...message, content: newText } : message
        )
      )
    },
    [messages, setMessages]
  )
  const conversationProps = useMemo(
    () => ({
      messages,
      status,
      onDelete: handleDelete,
      onEdit: handleEdit,
      onReload: reload,
    }),
    []
  );
  const chatInputProps = useMemo(
    () => ({
      input,
      setInput,
      append,
      status,
    }),
    [input, setInput, append, status]
  );
  useEffect(() => {
    console.log(status,'status');
    
  },[status])
  return (
    <div className="flex flex-col h-full w-full items-center justify-center">
      <Conversation {...conversationProps} />
      <ChatInput {...chatInputProps} />
    </div>
  );
}
