"use client";

import { useChat } from "@ai-sdk/react";
import { ChatInput } from "./chat-input";
import { Conversation } from "./conversation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import React from "react";
import { toast } from "sonner";
import { useMessages } from "@/lib/provider/message-provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useChatSession } from "@/lib/provider/chat-session-provider";
import { useSearchParams } from "next/navigation";
import { saveMessages } from "../_action/use-save-message";
import { createChat } from "../_action/use-create-chat";
import { DefaultChatTransport } from "ai";
import { useSession } from "@/lib/auth-client";
import { FileAttachment } from "./types";
import { useRouter } from "@/i18n/navigation";
export function ChatContainer() {
  const { messages: initMessage, isLoading } = useMessages();
  const { chatId } = useChatSession();
  const searchParams = useSearchParams();
  const firstMessage = searchParams?.get("firstMessage");
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data } = useSession();
  const user = data?.user;

  const hasProcessedFirstMessage = useRef(false);
  const pendingMessageRef = useRef<{
    text: string;
    attachments: FileAttachment[];
  } | null>(null);

  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const { messages, status, regenerate, setMessages, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai/chat",
      body: chatId ? { chatId } : undefined,
    }),
    messages: initMessage,

    onFinish: (data) => {
      const { message, messages } = data
      console.log("finish", message, messages);

      // 首次对话：创建会话
      if (!chatId && pendingMessageRef.current) {
        const pendingData = pendingMessageRef.current;
        pendingMessageRef.current = null;

        createConversationMutation.mutate({
          firstMessage: pendingData.text,
        });
        return;
      }

      // 已有会话：直接保存
      if (chatId) {
        saveMessageMutation.mutate({
          conversationId: chatId,
          messages,
        });
      }
    },

    onError: (error: any) => {
      console.error("chat error", error);
      toast.error(error?.message || "发送消息失败");
      if (!chatId && pendingMessageRef.current) {
        const pendingData = pendingMessageRef.current;
        setInput(pendingData.text);
        setAttachments(pendingData.attachments);
        pendingMessageRef.current = null;
      }
    },
  });

  // 保存消息 mutation
  const saveMessageMutation = useMutation({
    mutationFn: ({
      conversationId,
      messages,
    }: {
      conversationId: string;
      messages: any[];
    }) => saveMessages(conversationId, messages),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["chat-messages", chatId],
        exact: true,
      });
    },
    onError: (error: any) => {
      console.error("保存对话失败", error);
      toast.warning("保存对话失败，请稍后重试", { style: { color: "red" } });
    },
  });

  // 创建会话 mutation
  const createConversationMutation = useMutation({
    mutationFn: ({ firstMessage }: { firstMessage: string }) =>
      createChat({
        title: firstMessage.substring(0, 10),
        userId: user!.id,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      router.replace(`/ai/c/${data.id}`);

      // 保存当前消息
      if (messages.length > 0) {
        saveMessageMutation.mutate({
          conversationId: data.id,
          messages
        });
      }
    },
    onError: (error) => {
      console.error("创建会话失败:", error);
      toast.error("创建对话失败");
    },
  });

 

  // 初始化历史消息
  useEffect(() => {
    if (initMessage.length > 0 && messages.length === 0) {
      setMessages(initMessage);
    }
  }, [initMessage, messages.length, setMessages]);

  // 处理 URL 中的 firstMessage
  useEffect(() => {
    if (!isLoading && firstMessage && chatId && !hasProcessedFirstMessage.current) {
      hasProcessedFirstMessage.current = true;
      sendMessage({ text: firstMessage });
      const url = new URL(window.location.href);
      url.searchParams.delete("firstMessage");
      window.history.replaceState({}, "", url.toString());
    }
  }, [isLoading, firstMessage, chatId, sendMessage]);

  // chatId 变化时重置
  useEffect(() => {
    hasProcessedFirstMessage.current = false;
  }, [chatId]);

  // 删除消息
  const handleDelete = useCallback(
    (id: string) => {
      setMessages(messages.filter((message) => message.id !== id));
    },
    [messages, setMessages]
  );

  // 编辑消息
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

  // 发送消息
  const handleSubmit = useCallback(async () => {
    if (!input.trim() && attachments.length === 0) return;

    const isUploading = attachments.some((att) => att.uploading);
    if (isUploading) {
      toast.warning("请等待文件上传完成");
      return;
    }

    const hasError = attachments.some((att) => att.error);
    if (hasError) {
      toast.error("请移除上传失败的文件");
      return;
    }

    const messageContent = input.trim();
    const currentAttachments = [...attachments];

    const messageData = {
      role: "user" as const,
      text: messageContent,
    };

    // 首次对话
    if (!chatId) {
      pendingMessageRef.current = {
        text: messageContent,
        attachments: currentAttachments,
      };
    }

    // 清空输入
    setInput("");
    currentAttachments.forEach((att) => {
      if (att.preview) URL.revokeObjectURL(att.preview);
    });
    setAttachments([]);

    await sendMessage(messageData);
  }, [input, attachments, chatId, sendMessage]);

  const conversationProps = useMemo(
    () => ({
      messages,
      status,
      onDelete: handleDelete,
      onEdit: handleEdit,
      onregenerate: regenerate,
    }),
    [messages, status, handleDelete, handleEdit, regenerate]
  );

  const chatInputProps = useMemo(
    () => ({
      input,
      setInput,
      attachments,
      setAttachments,
      onSubmit: handleSubmit,
      status,
      hasHistory: messages.length > 0,
      isLoading,
      isCreatingChat: createConversationMutation.isPending,
    }),
    [
      input,
      attachments,
      handleSubmit,
      status,
      messages.length,
      isLoading,
      createConversationMutation.isPending,
    ]
  );

  return (
    <div className="flex flex-col h-full w-full items-center justify-center relative">
      <Conversation {...conversationProps} />
      <ChatInput {...chatInputProps} />
    </div>
  );
}
