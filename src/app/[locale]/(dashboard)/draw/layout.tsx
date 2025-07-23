"use client";

import { SidebatPanel } from "@/components/sidebar-panel";
import { DrawSidebar } from "./_component/sidebar";
import { AddGroupDialog } from "./_component/add-group-dialog";
import { useDrawStore } from "./_component/store";

export default function AiLayout({ children }: { children: React.ReactNode }) {
  const { showAddGroupDialog, setShowAddGroupDialog, createGroup } = useDrawStore();

  return (
    <div className="w-full h-full flex">
      <SidebatPanel>
        <DrawSidebar />
      </SidebatPanel>
      {children}
      
      <AddGroupDialog
        open={showAddGroupDialog}
        onOpenChange={setShowAddGroupDialog}
        onCreateGroup={createGroup}
      />
    </div>
  );
}
