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
import { deleteMessage } from "../_action/use-delete-message";
import { DefaultChatTransport } from "ai";
import { useSession } from "@/lib/auth-client";
import { FileAttachment } from "./types";
import { useRouter } from "@/i18n/navigation";

type PendingMessageState = {
  chatId: string | null;
  text: string;
  attachments: FileAttachment[];
  payload: {
    text: string;
    files?: FileList;
  };
  status: "pending" | "sending";
};

const pendingMessageStore: { current: PendingMessageState | null } = {
  current: null,
};

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
  const pendingMessageRef = useRef<PendingMessageState | null>(
    pendingMessageStore.current
  );
  const syncPendingMessage = useCallback(
    (value: PendingMessageState | null) => {
      pendingMessageStore.current = value;
      pendingMessageRef.current = value;
    },
    []
  );
  const activeChatId = chatId;

  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const { messages, status, regenerate, setMessages, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai/chat",
      body: activeChatId ? { chatId: activeChatId } : undefined,
    }),
    messages: initMessage,

    onFinish: (data) => {
      const { message, messages } = data;
      console.log("finish", message, messages);

      if (activeChatId) {
        saveMessageMutation.mutate({
          conversationId: activeChatId,
          messages,
        });
      } else {
        console.warn("未获取到会话 ID，无法保存消息");
      }
    },

    onError: (error: any) => {
      console.error("chat error", error);
      toast.error(error?.message || "发送消息失败");
      if (pendingMessageRef.current) {
        setInput(pendingMessageRef.current.text);
        setAttachments(pendingMessageRef.current.attachments);
        syncPendingMessage(null);
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
    onSuccess: (
      _,
      { conversationId }: { conversationId: string; messages: any[] }
    ) => {
      queryClient.invalidateQueries({
        queryKey: ["chat-messages", conversationId],
        exact: true,
      });
      if (
        pendingMessageRef.current &&
        pendingMessageRef.current.status === "sending"
      ) {
        syncPendingMessage(null);
      }
    },
    onError: (error: any) => {
      console.error("保存对话失败", error);
      toast.warning("保存对话失败，请稍后重试", {
        style: { color: "red" },
      });
    },
  });

  // 创建会话 mutation
  const createConversationMutation = useMutation({
    mutationFn: ({ firstMessage }: { firstMessage: string }) =>
      createChat({
        title: firstMessage.substring(0, 10),
        userId: user!.id,
      }),
  });

  // 初始化历史消息
  useEffect(() => {
    if (initMessage.length > 0 && messages.length === 0) {
      setMessages(initMessage);
    }
  }, [initMessage, messages.length, setMessages]);

  // 处理 URL 中的 firstMessage
  useEffect(() => {
    if (
      !isLoading &&
      firstMessage &&
      chatId &&
      !hasProcessedFirstMessage.current
    ) {
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

  // 当会话 ID 准备好后，发送首条待发送的消息
  useEffect(() => {
    if (
      chatId &&
      pendingMessageRef.current &&
      pendingMessageRef.current.chatId === chatId &&
      pendingMessageRef.current.status === "pending"
    ) {
      pendingMessageRef.current.status = "sending";
      (async () => {
        try {
          await sendMessage(pendingMessageRef.current!.payload);
        } catch (error) {
          console.error("发送首条消息失败", error);
          toast.error("发送首条消息失败");
          setInput(pendingMessageRef.current!.text);
          setAttachments(pendingMessageRef.current!.attachments);
          syncPendingMessage(null);
        }
      })();
    }
  }, [chatId, sendMessage, syncPendingMessage]);

  // 删除消息 mutation
  const deleteMessageMutation = useMutation({
    mutationFn: (messageId: string) => deleteMessage(messageId),
    onMutate: () => {
      const toastId = toast.loading("正在删除消息...");
      return { toastId };
    },
    onSuccess: (_, messageId, context) => {
      // 关闭loading提示
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
      // 更新本地状态
      setMessages(messages.filter((message) => message.id !== messageId));
      // 更新查询缓存
      if (activeChatId) {
        queryClient.invalidateQueries({
          queryKey: ["chat-messages", activeChatId],
          exact: true,
        });
      }
      toast.success("消息已删除");
    },
    onError: (error: any, _, context) => {
      // 关闭loading提示
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
      console.error("删除消息失败", error);
      toast.error(error?.message || "删除消息失败");
    },
  });

  // 删除消息
  const handleDelete = useCallback(
    (id: string) => {
      if (!activeChatId) {
        setMessages(messages.filter((message) => message.id !== id));
        return;
      }
      deleteMessageMutation.mutate(id);
    },
    [messages, setMessages, activeChatId, deleteMessageMutation]
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

    const fileList = currentAttachments.length > 0
      ? (() => {
          const dataTransfer = new DataTransfer();
          currentAttachments.forEach((att) => {
            dataTransfer.items.add(att.file);
          });
          return dataTransfer.files;
        })()
      : undefined;

    const messageData: {
      text: string;
      files?: FileList;
    } = {
      text: messageContent,
      ...(fileList && { files: fileList }),
    };

    if (!activeChatId) {
      syncPendingMessage({
        chatId: null,
        text: messageContent,
        attachments: currentAttachments,
        payload: messageData,
        status: "pending",
      });
      try {
        const data = await createConversationMutation.mutateAsync({
          firstMessage: messageContent,
        });
        if (pendingMessageRef.current) {
          syncPendingMessage({
            ...pendingMessageRef.current,
            chatId: data.id,
          });
        }
        router.push(`/ai/c/${data.id}`);
        queryClient.invalidateQueries({ queryKey: ["chats"] });
      } catch (error: any) {
        console.error("创建会话失败", error);
        toast.error(error?.message || "创建对话失败");
        syncPendingMessage(null);
        return;
      }
    }

    // 清空输入
    setInput("");
    currentAttachments.forEach((att) => {
      if (att.preview) URL.revokeObjectURL(att.preview);
    });
    setAttachments([]);

    if (activeChatId) {
      await sendMessage(messageData);
    }
  }, [
    input,
    attachments,
    activeChatId,
    sendMessage,
    createConversationMutation,
    queryClient,
    router,
    syncPendingMessage,
  ]);

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