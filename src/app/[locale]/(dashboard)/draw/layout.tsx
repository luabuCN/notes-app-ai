"use client";

import { SidebatPanel } from "@/components/sidebar-panel";
import { DrawSidebar } from "./_component/sidebar";
import { AddGroupDialog } from "./_component/add-group-dialog";
import { useDrawStore } from "./_component/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDrawGroup } from "./_action/use-create-draw-group";
import { toast } from "sonner";

export default function AiLayout({ children }: { children: React.ReactNode }) {
  const { showAddGroupDialog, setShowAddGroupDialog } = useDrawStore();
  const queryClient = useQueryClient();
  const creatDrawGroup = useMutation({
    mutationFn: (groupData: { name: string }) => createDrawGroup({ name: groupData.name }),
    onSuccess: () => {
      toast.success('创建成功');
      setShowAddGroupDialog(false);
      queryClient.invalidateQueries({ queryKey: ['drawGroups'] }); // 触发重新获取
    },
    onError: () => {
      toast.error('创建失败，请稍后重试');
      setShowAddGroupDialog(false);
    },
  });

  return (
    <div className="w-full h-full flex">
      <SidebatPanel>
        <DrawSidebar />
      </SidebatPanel>
      {children}

      <AddGroupDialog
        open={showAddGroupDialog}
        onOpenChange={setShowAddGroupDialog}
        onCreateGroup={creatDrawGroup.mutate}
      />
    </div>
  );
}
