"use client"

import { usePathname } from "@/i18n/navigation"
import { createContext, useContext, useMemo } from "react"

const ChatSessionContext = createContext<{ chatId: string | null }>({
  chatId: null,
})

export const useChatSession = () => useContext(ChatSessionContext)

export function ChatSessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const chatId = useMemo(() => {
    if (pathname?.startsWith("/ai/c/")) return pathname.split("/ai/c/")[1]
    return null
  }, [pathname])

  return (
    <ChatSessionContext.Provider value={{ chatId }}>
      {children}
    </ChatSessionContext.Provider>
  )
}
