import { ChatSessionProvider } from "@/lib/provider/chat-session-provider";
 
export default function AiLayout ({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatSessionProvider>
      {children}
    </ChatSessionProvider>
  )
}