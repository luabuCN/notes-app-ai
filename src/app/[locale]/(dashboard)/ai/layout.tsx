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
import { Sidebar } from "./_component/sidebar";

export default function AiLayout({ children }: { children: React.ReactNode }) {
  const [expand, setExpand] = useState(true);
  const [pin, setPin] = useState(true);
  return (
    <ChatSessionProvider>
      <Flexbox
        height={"100%"}
        horizontal
        className="min-h-[500px] relative"
        width={"100%"}
      >
        <DraggablePanel
          expand={expand}
          mode={pin ? "fixed" : "float"}
          onExpandChange={setExpand}
          pin={pin}
          placement="left"
          className="flex flex-col"
          minWidth={150}
          maxWidth={300}
        >
          <DraggablePanelContainer style={{ flex: 1 }}>
            <DraggablePanelHeader
              pin={pin}
              position="left"
              setExpand={setExpand}
              setPin={setPin}
            />
            <DraggablePanelBody>
              <Sidebar/>
            </DraggablePanelBody>
          </DraggablePanelContainer>
        </DraggablePanel>
        <div className="flex-1 p-[24px]"> {children}</div>
      </Flexbox>
    </ChatSessionProvider>
  );
}
