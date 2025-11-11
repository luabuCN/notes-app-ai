"use client"

import { getChatWithMessages } from "@/app/[locale]/(dashboard)/ai/_action/use-get-message"
import { useChatSession } from "@/lib/provider/chat-session-provider"
import { useQuery } from "@tanstack/react-query"
import type { UIMessage } from "ai"
import { createContext, useContext, useEffect, useState } from "react"

interface MessagesContextType {
  messages: UIMessage[]
  isLoading: boolean
  setMessages: React.Dispatch<React.SetStateAction<UIMessage[]>>
}

const MessagesContext = createContext<MessagesContextType | null>(null)

export function useMessages() {
  const context = useContext(MessagesContext)
  if (!context)
    throw new Error("错误")
  return context
}

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<UIMessage[]>([])
  const { chatId } = useChatSession()

  const {data: chatData, isLoading } = useQuery({
    queryKey: ['chat-messages',chatId],
    queryFn: () => getChatWithMessages(chatId!),
    enabled: !!chatId,
    staleTime: 1000 * 60 * 5,
  })
  useEffect(() => {
    if (chatId === null) {
      setMessages([])
    }
  }, [chatId])

  useEffect(() => {
    if(chatData?.messages) {
      setMessages(chatData.messages as unknown as UIMessage[])
    }
    console.log(chatData,'chatData------');
    
  }, [chatData])


  return (
    <MessagesContext.Provider
      value={{
        messages,
        isLoading,
        setMessages,
      }}
    >
      {children}
    </MessagesContext.Provider>
  )
}
