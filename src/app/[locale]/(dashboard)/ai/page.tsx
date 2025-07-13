"use client"
import React from "react";

import { ChatContainer } from "./_component/chat-container";
import { MessagesProvider } from "@/lib/provider/message-provider";

export default function AiPage() {
  
  return (
    <MessagesProvider>
      <ChatContainer/>
    </MessagesProvider>
  );
}
