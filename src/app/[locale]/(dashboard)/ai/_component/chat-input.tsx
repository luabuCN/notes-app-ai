"use client";

import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { Button } from "@/components/ui/button";
import { ArrowUp, Loader2, Square } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ButtonFileUpload } from "./button-file-upload";
import { useUploadThing } from "@/lib/uploadthing-client";
import { FileList } from "./file-list";
import { FileAttachment } from "./types";
import { toast } from "sonner";

type ChatInputProps = {
  input: string;
  setInput: (value: string) => void;
  attachments: FileAttachment[];
  setAttachments: React.Dispatch<React.SetStateAction<FileAttachment[]>>;
  onSubmit: () => void;
  status: "streaming" | "ready" | "submitted" | "error";
  hasHistory: boolean;
  isLoading: boolean;
  isCreatingChat?: boolean;
};

export function ChatInput({
  input,
  setInput,
  attachments,
  setAttachments,
  onSubmit,
  status,
  hasHistory,
  isLoading,
  isCreatingChat = false,
}: ChatInputProps) {
  const t = useTranslations("ai");
  const { data, isPending } = useSession();
  const user = data?.user;

  // 使用 UploadThing Hook 上传文件到服务器做记录
  const { startUpload, isUploading } = useUploadThing("editorUploader", {
    onClientUploadComplete: (res) => {
      console.log("Upload completed:", res);
      toast.success("文件上传成功");
    },
    onUploadError: (error: Error) => {
      console.error(error,'error------');
      
      toast.error(`上传失败: ${error.message}`);
    },
  });

  // 处理文件选择并上传到 UploadThing
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

    try {
      // 使用 UploadThing 上传文件到服务器做记录
      const uploadedFiles = await startUpload(files);

      if (!uploadedFiles) {
        throw new Error("上传失败");
      }

      // 更新附件状态，保存上传后的 URL
      setAttachments((prev) =>
        prev.map((att) => {
          const uploaded = uploadedFiles.find(
            (uf) => uf.name === att.file.name && uf.size === att.file.size
          );

          if (uploaded) {
            return {
              ...att,
              uploading: false,
              // 保存上传后的 URL 用于记录（优先使用 url，如果没有则使用 ufsUrl）
              url: uploaded.url || (uploaded as any).ufsUrl,
            };
          }
          return att;
        })
      );
    } catch (error) {
      console.error("Failed to upload file:", error);
      setAttachments((prev) =>
        prev.map((att) =>
          files.includes(att.file)
            ? { ...att, uploading: false, error: "上传文件失败" }
            : att
        )
      );
      toast.error("上传文件失败");
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

  const handleValueChange = (val: string) => {
    setInput(val);
  };

  const isSubmitting = status === "submitted" || status === "streaming" || isCreatingChat;
  const isDisabled = isUploading || attachments.some((att) => att.uploading) || isCreatingChat;

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
        isLoading={isSubmitting}
        onSubmit={onSubmit}
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
              isSubmitting
                ? "Stop generation"
                : "Send message"
            }
          >
            <Button
              variant="default"
              size="icon"
              className="h-8 w-8 rounded-full cursor-pointer"
              onClick={onSubmit}
              disabled={isDisabled}
            >
              {isSubmitting ? (
                <Square className="size-3 fill-current" />
              ) : (
                <ArrowUp className="size-5" />
              )}
            </Button>
          </PromptInputAction>
        </PromptInputActions>
      </PromptInput>
    </div>
  );
}