"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pen, SquarePen, Trash } from "lucide-react";
import { getAllChats } from "../action/get-all-chats";
import { Skeleton } from "@/components/ui/skeleton";
import { Conversation } from "@prisma/client";
import { useRouter } from "@/i18n/navigation";
import { delChat } from "../action/use-del-chat";
import { toast } from "sonner";
import { useChatSession } from "@/lib/provider/chat-session-provider";
import { updateChat } from "../action/update-chats";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
export function Sidebar() {
  const router = useRouter();
  const { data: chats, isLoading } = useQuery({
    queryKey: ["chats"],
    queryFn: () => getAllChats(),
  });
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [inputValue, setInputValue] = React.useState<string>("");

  return (
    <div className="w-full h-full min-w-[150px] overflow-hidden flex flex-col gap-20px space-y-5">
      <div
        className="w-full h-[30px] px-2 flex items-center space-x-2 cursor-pointer hover:bg-gray-100 rounded-sm"
        onClick={() => router.push("/ai")}
      >
        <SquarePen size={16} className="mr-2" /> 新对话
      </div>
      <div className="w-full flex-1">
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        )}
        <div className="space-y-1">
          {chats?.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              onClick={() => router.push(`/ai/c/${chat.id}`)}
              editingId={editingId}
              setEditingId={setEditingId}
              inputValue={inputValue}
              setInputValue={setInputValue}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatItem({
  chat,
  onClick,
  editingId,
  setEditingId,
  inputValue,
  setInputValue,
}: {
  chat: Conversation;
  onClick: () => void;
  editingId: string | null;
  setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { chatId } = useChatSession();
  const deleteChat = useMutation({
    mutationFn: (id: string) => delChat(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      toast.success("删除成功", {
        id: "delete-chat",
        duration: 2000,
      });
      if (chatId === chat.id) {
        router.push(`/ai`);
      } else {
        queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
      }
    },
    onError: (error) => {
      toast.error(error.message, {
        id: "delete-chat",
      });
    },
  });
  const updateChatMutation = useMutation({
    mutationFn: (data: { id: string; title: string }) =>
      updateChat(data.id, data.title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      toast.success("保存成功", {
        id: "update-chat",
        duration: 2000,
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "保存失败", {
        id: "update-chat",
      });
    },
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.loading("删除中...", {
      id: "delete-chat",
    });
    deleteChat.mutate(chat.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(chat.id);
    setInputValue(chat.title || "");
  };

  const handleBlur = () => {
    if (inputValue.trim() !== chat.title) {
      toast.loading("保存中...", { id: "update-chat" });
      updateChatMutation.mutate({ id: chat.id, title: inputValue.trim() });
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div
      className={cn(
        "w-full h-[30px] px-2 flex items-center justify-between  space-x-2 cursor-pointer hover:bg-gray-100 rounded-sm group",
        {
          "bg-gray-100": chatId === chat.id,
        }
      )}
      onClick={onClick}
    >
      {editingId === chat.id ? (
        <Input
          className="text-sm max-w-[150px] h-[25px] truncate border rounded px-1 outline-none"
          value={inputValue}
          autoFocus
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={updateChatMutation.isPending}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="text-sm w-[150px] truncate">{chat.title}</span>
      )}
      <span className="space-x-2 flex items-center opacity-0 group-hover:opacity-100">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary" size="icon" className="size-6">
              <Pen
                onClick={handleEdit}
                className={`cursor-pointer transition-opacity ${updateChatMutation.isPending
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:opacity-70"
                  }`}
                style={{
                  pointerEvents: updateChatMutation.isPending ? "none" : "auto",
                }}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>编辑</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary" size="icon" className="size-6" >
              <Trash
                onClick={handleDelete}
                className={`cursor-pointer transition-opacity ${deleteChat.isPending
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:opacity-70"
                  }`}
                style={{ pointerEvents: deleteChat.isPending ? "none" : "auto" }}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>删除</p>
          </TooltipContent>
        </Tooltip>

      </span>
    </div>
  );
}
