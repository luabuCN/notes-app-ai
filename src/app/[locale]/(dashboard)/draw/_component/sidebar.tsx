import React, { useEffect, useState } from 'react';
import {
  Folder,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WhiteboardGroup, WhiteboardItem, DeletedItem } from './types';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GroupItem } from './group-item';
import { useDrawStore } from './store';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllDrawGroups } from '../_action/get-all-draw-groups';

export function DrawSidebar() {
  const {
    groups,
    deletedItems,
    editingItem,
    editingName,
    editingEmoji,
    showAddGroupDialog,
    createNewWhiteboard,
    createNewGroup,
    toggleGroupExpansion,
    startEditing,
    cancelEditing,
    saveEdit,
    deleteItem,
    setEditingName,
    setEditingEmoji,
    setShowAddGroupDialog,
    setGroups,
  } = useDrawStore();

  const { data: groupsData, isLoading } = useQuery({
    queryKey: ["drawGroups"],
    queryFn: () => getAllDrawGroups(),
  });

  useEffect(() => {
    if (!groupsData) return;
    setGroups(groupsData);
  }, [groupsData]);


  return (
    <div className="w-full h-full min-w-[200px] overflow-hidden bg-white border-gray-200 flex flex-col">
      <div className="border-gray-200 mb-4">
        <Button
          onClick={createNewGroup}
          variant="ghost"
          size="sm"
          className="w-full cursor-pointer justify-start px-2 py-1.5 h-auto text-sm font-normal text-gray-600 hover:bg-gray-100"
        >
          <Plus className="h-4 w-4 mr-2" />
          新建项目
        </Button>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto">
        {/* 白板列表 */}
        <div className=" space-y-2">
          {groups.map(group => (
            <GroupItem
              key={group.id}
              group={group}
              editingItem={editingItem}
              editingName={editingName}
              editingEmoji={editingEmoji}
              onToggleExpansion={toggleGroupExpansion}
              onStartEditing={startEditing}
              onCancelEditing={cancelEditing}
              onSaveEdit={saveEdit}
              onDeleteItem={deleteItem}
              onEditingNameChange={setEditingName}
              onEditingEmojiChange={setEditingEmoji}
              onCreateWhiteboard={createNewWhiteboard}
            />
          ))}
          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          )}
          {groups.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <Folder className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">还没有分组</p>
              <p className="text-xs text-gray-400">点击上方按钮创建第一个分组</p>
            </div>
          )}
        </div>
        {/* )} */}
      </div>


    </div>
  );
}