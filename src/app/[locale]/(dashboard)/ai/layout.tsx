"use client";

import { ChatSessionProvider } from "@/lib/provider/chat-session-provider";
import { SidebatPanel } from "@/components/sidebar-panel";
import { Sidebar } from "./_component/sidebar";

export default function AiLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatSessionProvider>
      <div className="flex w-full h-full">
        <SidebatPanel>
          <Sidebar />
        </SidebatPanel>
        {children}
      </div>
    </ChatSessionProvider>
  );
}
