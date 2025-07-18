"use client";

import { SidebatPanel } from "@/components/sidebar-panel";
import { DrawSidebar } from "./_component/sidebar";

export default function AiLayout({ children }: { children: React.ReactNode }) {

  return (
   <div className="w-full h-full flex ">
    <SidebatPanel>
      <DrawSidebar/>
    </SidebatPanel>
    {children}
   </div>
  );
}
