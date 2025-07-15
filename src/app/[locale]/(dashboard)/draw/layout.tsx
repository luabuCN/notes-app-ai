"use client";

import { SidebatPanel } from "@/components/sidebar-panel";

export default function AiLayout({ children }: { children: React.ReactNode }) {

  return (
   <div className="w-full h-full flex ">
    <SidebatPanel>
      <div>侧边栏</div>
    </SidebatPanel>
    {children}
   </div>
  );
}
