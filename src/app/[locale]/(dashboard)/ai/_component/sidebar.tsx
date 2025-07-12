"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pen, SquarePen, Trash } from "lucide-react";
import { getAllChats } from "../action/get-all-chats";
import { Skeleton } from "@/components/ui/skeleton";
import { Conversation } from "@prisma/client";
import { useRouter } from "@/i18n/navigation";
import { delChat } from "../action/use-del-chat";
import { toast } from "sonner";
import { useChatSession } from '@/lib/provider/chat-session-provider'
import { cn } from "@/lib/utils";
export function Sidebar() {
  const router = useRouter();
  const { data: chats, isLoading } = useQuery({
    queryKey: ["chats"],
    queryFn: () => getAllChats(),
  });
  
  return (
    <div className="w-full h-full flex flex-col gap-20px space-y-5">
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
        {!isLoading && chats?.length === 0 && <div>暂无数据</div>}
        <div className="space-y-1">
          {chats?.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              onClick={() => router.push(`/ai/c/${chat.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatItem({ chat, onClick }: { chat: Conversation; onClick: () => void }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { chatId } = useChatSession()
  const deleteChat = useMutation({
    mutationFn: (id: string) => delChat(id),
    onSuccess:() => {
      queryClient.invalidateQueries({ queryKey: ['chats']});
      toast.success("删除成功", {
        id: "delete-chat",
        duration: 2000,
      });
      if(chatId === chat.id) {
        router.push(`/ai`);
      } else {
        queryClient.invalidateQueries({ queryKey: ['chat-messages']});
      }
    },
    onError: (error) => {
      toast.error(error.message, {
        id: "delete-chat",
      });
    }
  })
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    toast.loading("删除中...",{
      id: "delete-chat",
    })
    deleteChat.mutate(chat.id);
  }
  
  return (
    <div 
      className={cn('w-full h-[30px] px-2 flex items-center justify-between  space-x-2 cursor-pointer hover:bg-gray-100 rounded-sm group', {
        'bg-gray-100': chatId === chat.id,
      })}
      onClick={onClick}
    >
      <span className="text-sm w-[150px] truncate">{chat.title}</span>
      <span className="space-x-2 flex items-center opacity-0 group-hover:opacity-100">
        <Pen size={14} />
        <Trash 
          size={14} 
          onClick={handleDelete}
          className={`cursor-pointer transition-opacity ${
            deleteChat.isPending ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-70'
          }`}
          style={{ pointerEvents: deleteChat.isPending ? 'none' : 'auto' }}
        />
      </span>
    </div>
  );
}
