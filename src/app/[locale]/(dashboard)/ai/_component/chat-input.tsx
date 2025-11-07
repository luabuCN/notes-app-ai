"use client";

import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { Button } from "@/components/ui/button";
import { ArrowUp, Loader2, Square } from "lucide-react";
// import { PromptSuggestion } from "@/components/ui/prompt-suggestion";
import { useSession } from "@/lib/auth-client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { createChat } from "../_action/use-create-chat";
import { useChatSession } from "@/lib/provider/chat-session-provider";
import { toast } from "sonner";
import { ButtonFileUpload } from "./button-file-upload";
import { useUploadThing } from "@/lib/uploadthing-client";
import { FileList } from "./file-list";
import { FileAttachment, type SendMessage } from "./types";

type ChatInputProps = {
  sendMessage: SendMessage;
  status: "streaming" | "ready" | "submitted" | "error";
  hasHistory: boolean;
  isLoading: boolean;
};

export function ChatInput({
  sendMessage,
  status,
  hasHistory,
  isLoading,
}: ChatInputProps) {
  const t = useTranslations("ai");
  const { data, isPending } = useSession();
  const user = data?.user;
  const { chatId } = useChatSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  // 使用 UploadThing Hook
  const { startUpload, isUploading } = useUploadThing("editorUploader", {
    onClientUploadComplete: (res) => {
      console.log("Upload completed:", res);
      toast.success("文件上传成功");
    },
    onUploadError: (error: Error) => {
      toast.error(`上传失败: ${error.message}`);
    },
  });
  const createConversationMutation = useMutation({
    mutationFn: () =>
      createChat({
        title: input.substring(0, 10),
        userId: user!.id,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      // 使用 replace 而不是 push，避免历史记录堆积
      router.replace(
        `/ai/c/${data.id}?firstMessage=${encodeURIComponent(input)}`
      );
    },
    onError: (error) => {
      console.error("Failed to create chat:", error);
      toast.error("创建对话失败");
    },
  });
  //上传
  const handleFileUpload = async (files: File[]) => {
    const newAttachments: FileAttachment[] = files.map((file) => ({
      file,
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined,
      uploading: true,
    }));

    setAttachments((prevAttachments) => [
      ...prevAttachments,
      ...newAttachments,
    ]);

    // 上传文件到 uploadthing
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();

      formData.append("file", file);

      try {
        // 使用 UploadThing 上传
        const uploadedFiles = await startUpload(files);

        if (!uploadedFiles) {
          throw new Error("上传失败");
        }

        // 更新附件状态
        setAttachments((prev) =>
          prev.map((att) => {
            const uploaded = uploadedFiles.find(
              (uf) => uf.name === att.file.name && uf.size === att.file.size
            );

            if (uploaded) {
              return {
                ...att,
                uploading: false,
                url: uploaded.ufsUrl,
              };
            }
            return att;
          })
        );
      } catch (error) {
        console.error("Failed to upload file:", error);
        setAttachments((prev) =>
          prev.map((att) =>
            att.file === file
              ? { ...att, uploading: false, error: "上传文件失败" }
              : att
          )
        );
        toast.error("上传文件失败");
      }
    }
  };
  // 移除附件
  const handleRemoveAttachment = (file: File) => {
    setAttachments((prev) => {
      const newAttachments = prev.filter((att) => {
        if (att.file === file || (att.file.name === file.name && att.file.size === file.size)) {
          if (att.preview) {
            URL.revokeObjectURL(att.preview);
          }
          return false;
        }
        return true;
      });
      return newAttachments;
    });
  };
  const handleSubmit = async () => {
    if (!input.trim() && attachments.length === 0) return;
    
    // 检查是否有文件正在上传
    const isUploading = attachments.some(att => att.uploading);
    if (isUploading) {
      toast.warning('请等待文件上传完成');
      return;
    }

    // 检查是否有上传失败的文件
    const hasError = attachments.some(att => att.error);
    if (hasError) {
      toast.error('请移除上传失败的文件');
      return;
    }
    
    // 准备消息内容（不要在此处清空输入与附件，以免在创建首个会话时丢失内容）
    const messageContent = input.trim();

    // 构建消息内容
    // const fileUrls = attachments.filter(att => att.url).map(att => att.url);
    
    // 准备消息数据
    const messageData = {
      role: "user",
      text: messageContent,
    };

    // 如果有文件，添加到消息的 experimental_attachments
    // if (fileUrls.length > 0) {
    //   messageData.experimental_attachments = attachments.map(att => ({
    //     name: att.file.name,
    //     contentType: att.file.type,
    //     url: att.url!,
    //   }));
    // }

    if (!chatId) {
      // 首次会话：仅创建会话并通过路由参数传递首条消息，避免提前清空输入
      createConversationMutation.mutate();
      return;
    }

    // 发送消息
    await sendMessage(messageData);
    
    // 清理状态
    setInput("");
    attachments.forEach(att => {
      if (att.preview) URL.revokeObjectURL(att.preview);
    });
    setAttachments([]);
  };

  const handleValueChange = (val: string) => {
    setInput(val);
  };

  return (
    <div
      className={cn(
        "w-full max-w-3xl z-10 py-2",
        hasHistory || isLoading
          ? "absolute bottom-0 left-1/2 -translate-x-1/2"
          : ""
      )}
    >
      {!hasHistory && !isLoading && (
        <div className="flex items-center justify-center mb-4">
          <span className="text-2xl text-gray-500 flex items-center gap-2">
            👋 {t("hello")}{" "}
            {isPending ? (
              <Loader2 className="animate-spin size-4" />
            ) : (
              user?.name
            )}{" "}
            {t("assistant")}
          </span>
        </div>
      )}
      
      <PromptInput
        value={input}
        onValueChange={handleValueChange}
        isLoading={status === "submitted" || status === "streaming"}
        onSubmit={handleSubmit}
        className="w-full max-w-(--breakpoint-md)"
      >
        <FileList files={attachments} onFileRemove={handleRemoveAttachment} />
        <PromptInputTextarea placeholder={t("inputPlaceholder")} />
        <PromptInputActions className="flex w-full justify-between pt-2">
          <div className="flex gap-2">
            <ButtonFileUpload onFileUpload={handleFileUpload} />
          </div>
          <PromptInputAction
            tooltip={
              status === "submitted" || status === "streaming"
                ? "Stop generation"
                : "Send message"
            }
          >
            <Button
              variant="default"
              size="icon"
              className="h-8 w-8 rounded-full cursor-pointer"
              onClick={handleSubmit}
              disabled={
                createConversationMutation.isPending ||
                isUploading ||
                attachments.some((att) => att.uploading)
              }
            >
              {status === "submitted" || status === "streaming" ? (
                <Square className="size-3 fill-current" />
              ) : (
                <ArrowUp className="size-5" />
              )}
            </Button>
          </PromptInputAction>
        </PromptInputActions>
      </PromptInput>
      {/* {!hasHistory && !isLoading && (
        <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-(--breakpoint-md)">
          <PromptSuggestion onClick={() => setInput("Tell me a joke")}>
            Tell me a joke
          </PromptSuggestion>
          <PromptSuggestion onClick={() => setInput("How does this work?")}>
            How does this work?
          </PromptSuggestion>
          <PromptSuggestion
            onClick={() => setInput("Generate an image of a cat")}
          >
            Generate an image of a cat
          </PromptSuggestion>
          <PromptSuggestion onClick={() => setInput("Write a poem")}>
            Write a poem
          </PromptSuggestion>
          <PromptSuggestion onClick={() => setInput("Code a React component")}>
            Code a React component
          </PromptSuggestion>
        </div>
      )} */}
    </div>
  );
}
