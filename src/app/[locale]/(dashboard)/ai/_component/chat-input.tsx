"use client";

import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { Button } from "@/components/ui/button";
import { ArrowUp, Loader2, Square } from "lucide-react";
import { PromptSuggestion } from "@/components/ui/prompt-suggestion";
import { useSession } from "@/lib/auth-client";
import { CreateMessage, Message } from "@ai-sdk/react";
import { Dispatch, SetStateAction, useEffect } from "react";
import { ChatRequestOptions } from "ai";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { createChat } from "../action/use-create-chat";
import { useChatSession } from "@/lib/provider/chat-session-provider"
import { toast } from "sonner";
type ChatInputProps = {
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  status: "streaming" | "ready" | "submitted" | "error";
  hasHistory: boolean;
};

export function ChatInput({
  input,
  setInput,
  append,
  status,
  hasHistory,
}: ChatInputProps) {
  const t = useTranslations("ai");

  const { data, isPending } = useSession();
  const user = data?.user;
  const { chatId } = useChatSession()
  const router = useRouter()
  const queryClient = useQueryClient();

  const createConversationMutation = useMutation({
    mutationFn: () => createChat({
      title: input.substring(0, 10),
      userId: user!.id,
    }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
      router.push(`/ai/c/${data.id}?firstMessage=${encodeURIComponent(input)}`);
    },
    onError: (error) => {
      console.error('Failed to create chat:', error);
      toast.error('创建对话失败');
    }
  });

  const handleSubmit = () => {
    if (!input.trim()) return;
    if (!chatId) {
      createConversationMutation.mutate();
      return;
    }
    append({ content: input, role: "user" });
    setInput("");
  };

  const handleValueChange = (val: string) => {
    setInput(val);
  };

  return (
    <div
      className={cn(
        "w-full max-w-3xl z-10 py-2",
        hasHistory ? "absolute bottom-0 left-1/2 -translate-x-1/2" : ""
      )}
    >
      {!hasHistory && (
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
        <PromptInputTextarea placeholder={t("inputPlaceholder")} />
        <PromptInputActions className="justify-end pt-2">
          <PromptInputAction
            tooltip={
              (status === "submitted" || status === "streaming") ? "Stop generation" : "Send message"
            }
          >
            <Button
              variant="default"
              size="icon"
              className="h-8 w-8 rounded-full cursor-pointer"
              onClick={handleSubmit}
            >
              {(status === "submitted" || status === "streaming") ? (
                <Square className="size-3 fill-current" />
              ) : (
                <ArrowUp className="size-5" />
              )}
            </Button>
          </PromptInputAction>
        </PromptInputActions>
      </PromptInput>
      {!hasHistory && (
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
      )}
    </div>
  );
}
