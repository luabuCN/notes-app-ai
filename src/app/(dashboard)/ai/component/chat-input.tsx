"use client";


import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input"
import { Button } from "@/components/ui/button"
import { ArrowUp, Loader2, Square } from "lucide-react"
import { PromptSuggestion } from "@/components/ui/prompt-suggestion";
import { useSession } from "@/lib/auth-client";
import { CreateMessage, Message } from "@ai-sdk/react";
import { Dispatch, SetStateAction } from "react";
import { ChatRequestOptions } from "ai";

type ChatInputProps = {
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  append: (message: Message | CreateMessage, chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>;
  status: "streaming" | "ready" | "submitted" | "error";
}

export  function ChatInput({input, setInput, append, status}:ChatInputProps) {

  const { data, isPending } = useSession();
  const user = data?.user;
  const handleSubmit = () => {
    append({ content: input, role: "user" });
    setInput('')
  }

  const handleValueChange = (val:string) => {
    setInput(val)
  }
  return (
   <>
    <div className="flex items-center justify-center mb-4">
      <span className="text-2xl text-gray-500 flex items-center gap-2">👋 你好 {isPending ? <Loader2 className="animate-spin size-4"/> : user?.name} 我是你的 AI 助手</span>
    </div>
     <PromptInput
      value={input}
      onValueChange={handleValueChange}
      isLoading={status === "submitted"}
      onSubmit={handleSubmit}
      className="w-full max-w-(--breakpoint-md)"
    >
      <PromptInputTextarea placeholder="有什么可以帮助你的吗？" />
      <PromptInputActions className="justify-end pt-2">
        <PromptInputAction
          tooltip={status === "submitted" ? "Stop generation" : "Send message"}
        >
          <Button
            variant="default"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={handleSubmit}
          >
            {status === "submitted" ? (
              <Square className="size-5 fill-current" />
            ) : (
              <ArrowUp className="size-5" />
            )}
          </Button>
        </PromptInputAction>
      </PromptInputActions>
    </PromptInput>
     <div className="flex flex-wrap gap-2 mt-4  max-w-(--breakpoint-md)">
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
     <PromptSuggestion
       onClick={() => setInput("Code a React component")}
     >
       Code a React component
     </PromptSuggestion>
   </div>
   </>
  )
}
