"use client"
import React, { useEffect } from "react";

import { ChatContainer } from "./_component/chat-container";
import { MessagesProvider } from "@/lib/provider/message-provider";
import { useRouter } from "@/i18n/navigation";

export default function AiPage() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/ai/c/[id]');
  }, [router]);

  return (
    <MessagesProvider>
      <ChatContainer />
    </MessagesProvider>
  );
}
