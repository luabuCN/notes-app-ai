"use client";

import { Folder, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDrawStore } from "./_component/store";

export default function DrawPage() {
  const { setShowAddGroupDialog } = useDrawStore();

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-card">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-4">
          <Folder className="h-16 w-16 text-gray-300 mx-auto" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-700">还没有选择画板</h2>
            <p className="text-sm text-gray-500">
              从左侧边栏选择一个现有的画板，或者创建一个新的项目开始绘制
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            className="w-full"
            size="lg"
            onClick={() => setShowAddGroupDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            新建项目
          </Button>
          <p className="text-xs text-gray-400">
            您也可以点击左侧边栏的 "新建项目" 按钮
          </p>
        </div>
      </div>
    </div>
  );
}
