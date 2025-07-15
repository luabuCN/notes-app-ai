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
import { useLocale } from "next-intl";

export function ChatContainer() {
  const { messages: initMessage, isLoading } = useMessages();
  const { chatId } = useChatSession();
  const searchParams = useSearchParams();
  const firstMessage = searchParams?.get('firstMessage');
  const queryClient = useQueryClient();
  const locale = useLocale();
  const lastSavedMessageCountRef = useRef(0);
  const { messages, input, status, reload, setMessages, setInput, append } =
    useChat({
      api: "/api/ai/chat",
      initialMessages: initMessage,
    });

  //保存对话消息
  const saveMessageMutation = useMutation({
    mutationFn: ({ conversationId, messages }: { conversationId: string, messages: any[] }) =>
      saveMessages(conversationId, messages),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', chatId], exact: true });

    },
    onError: (error) => {
      toast.error('保存消息失败');
    }
  })

  useEffect(() => {
    if (initMessage.length > 0 && messages.length === 0) {
      setMessages(initMessage);
    }
  }, [initMessage, messages.length, setMessages]);

  // 处理首次消息发送
  useEffect(() => {
    if (!isLoading && firstMessage && messages.length === 0 && chatId) {
      append({ content: firstMessage, role: "user" });
      window.history.replaceState({}, '', `/${locale}/ai/c/${chatId}`);
    }
  }, [isLoading, firstMessage, messages.length, chatId, append])

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

  useEffect(() => {
    if (status === "ready" && chatId && messages.length > 0 &&
      messages.length !== lastSavedMessageCountRef.current) {

      // 确保最后一条消息不是正在生成中的消息
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
  }, [status, messages, chatId]);

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
