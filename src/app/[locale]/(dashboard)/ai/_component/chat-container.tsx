"use client";

import { useChat } from "@ai-sdk/react";
import { ChatInput } from "./chat-input";
import { Conversation } from "./conversation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import React from "react";
import { toast } from "sonner";
import { useMessages } from "@/lib/provider/message-provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useChatSession } from "@/lib/provider/chat-session-provider";
import { useSearchParams } from "next/navigation";
import { saveMessages } from "../_action/use-save-message";
// import { useLocale } from "next-intl";

export function ChatContainer() {
  const { messages: initMessage, isLoading } = useMessages();
  const { chatId } = useChatSession();
  const searchParams = useSearchParams();
  const firstMessage = searchParams?.get('firstMessage');
  const queryClient = useQueryClient();
  // const locale = useLocale();
  const lastSavedMessageCountRef = useRef(0);
  const hasProcessedFirstMessage = useRef(false);
  
  const { messages, input, status, reload, setMessages, setInput, append } =
    useChat({
      api: "/api/ai/chat",
      initialMessages: initMessage,
      // 添加 body 配置，确保 chatId 被传递
      body: chatId ? { chatId } : undefined,
    });

  // 保存对话消息
  const saveMessageMutation = useMutation({
    mutationFn: ({ conversationId, messages }: { conversationId: string, messages: any[] }) =>
      saveMessages(conversationId, messages),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', chatId], exact: true });
    },
    onError: (error:any) => {
      toast.error(error);
    }
  })

  // 初始化消息
  useEffect(() => {
    if (initMessage.length > 0 && messages.length === 0) {
      setMessages(initMessage);
      lastSavedMessageCountRef.current = initMessage.length;
    }
  }, [initMessage, messages.length, setMessages]);

  // 处理首次消息发送
  useEffect(() => {
    if (!isLoading && 
        firstMessage && 
        chatId && 
        !hasProcessedFirstMessage.current) {
      hasProcessedFirstMessage.current = true;
      append({ content: firstMessage, role: "user" });
      // 清理 URL 中的 firstMessage 参数
      const url = new URL(window.location.href);
      url.searchParams.delete('firstMessage');
      window.history.replaceState({}, '', url.toString());
    }
  }, [isLoading, firstMessage, chatId, append])

  // 重置 firstMessage 标记当 chatId 改变
  useEffect(() => {
    hasProcessedFirstMessage.current = false;
  }, [chatId]);

  const handleDelete = useCallback(
    (id: string) => {
      setMessages(messages.filter((message) => message.id !== id));
    },
    [messages, setMessages]
  );

  const handleEdit = useCallback(
    (id: string, newText: string) => {
      setMessages(
        messages.map((message) =>
          message.id === id ? { ...message, content: newText } : message
        )
      );
    },
    [messages, setMessages]
  );

  const conversationProps = useMemo(
    () => ({
      messages,
      status,
      onDelete: handleDelete,
      onEdit: handleEdit,
      onReload: reload,
    }),
    [messages, status, handleDelete, handleEdit, reload]
  );

  // 自动保存消息
  useEffect(() => {
    if (status === "ready" && chatId && messages.length > 0 &&
      messages.length !== lastSavedMessageCountRef.current) {

      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.content && lastMessage.content.trim() !== '') {
        saveMessageMutation.mutate({
          conversationId: chatId,
          messages: messages
        });
        lastSavedMessageCountRef.current = messages.length;
      }
    }

    if (status === "error") {
      toast.warning("出现错误，请稍后重试", { style: { color: "red" } });
    }
  }, [status, messages, chatId,saveMessageMutation]);

  const chatInputProps = useMemo(
    () => ({
      input,
      setInput,
      append,
      status,
      hasHistory: messages.length > 0,
      isLoading,
    }),
    [input, setInput, append, status, messages, isLoading]
  );

  return (
    <div className="flex flex-col h-full w-full items-center justify-center relative">
      <Conversation {...conversationProps} />
      <ChatInput {...chatInputProps} />
    </div>
  );
}