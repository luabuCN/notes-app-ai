"use client";
import { ChatSessionProvider } from "@/lib/provider/chat-session-provider";
import {
  DraggablePanel,
  DraggablePanelBody,
  DraggablePanelContainer,
  DraggablePanelFooter,
  DraggablePanelHeader,
} from "@lobehub/ui";
import { useState } from "react";
import { Flexbox } from "react-layout-kit";

export default function AiLayout({ children }: { children: React.ReactNode }) {
  const [expand, setExpand] = useState(true);
  const [pin, setPin] = useState(true);
  return (
    <ChatSessionProvider>
      <Flexbox
        height={"100%"}
        horizontal
        style={{ minHeight: 500, position: "relative" }}
        width={"100%"}
      >
        <DraggablePanel
          expand={expand}
          mode={pin ? "fixed" : "float"}
          onExpandChange={setExpand}
          pin={pin}
          placement="left"
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <DraggablePanelContainer style={{ flex: 1 }}>
            <DraggablePanelHeader
              pin={pin}
              position="left"
              setExpand={setExpand}
              setPin={setPin}
              title="Header"
            />
            <DraggablePanelBody>DraggablePanel</DraggablePanelBody>
          </DraggablePanelContainer>
        </DraggablePanel>
        <div className="flex-1 p-[24px]"> {children}</div>
      </Flexbox>
    </ChatSessionProvider>
  );
}
