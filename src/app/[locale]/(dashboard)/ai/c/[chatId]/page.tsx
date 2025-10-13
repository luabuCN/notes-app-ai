"use client"
import React from "react";
import { ChatContainer } from "../../_component/chat-container";
import { MessagesProvider } from "@/lib/provider/message-provider";

export default function ChatPage() {
  return (
    <MessagesProvider>
      <ChatContainer />
    </MessagesProvider>
  );
}