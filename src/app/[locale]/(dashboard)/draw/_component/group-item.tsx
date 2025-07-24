import React, { useEffect, useRef, useState } from "react";
import {
  // ChevronDown,
  // ChevronRight,
  FolderOpen, // 新增
  Folder,     // 新增
  Edit3,
  Trash2,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { WhiteboardGroup } from "./types";
import { DrawItem } from "./draw-item";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateDrawGroup } from "../_action/use-update-draw-group";
import { deleteDrawGroup } from "../_action/use-delete-draw-group";
import { create } from 'zustand';

interface GroupItemProps {
  group: WhiteboardGroup;
  editingItem: {
    type: "group" | "whiteboard";
    id: string;
    groupId?: string;
    isCreate: boolean;
  } | null;
  editingName: string;
  editingEmoji: string;
  onToggleExpansion: (groupId: string) => void;
  onStartEditing: (
    type: "group" | "whiteboard",
    id: string,
    groupId?: string
  ) => void;
  onCancelEditing: () => void;
  onSaveEdit: () => void;
  onDeleteItem: (
    type: "group" | "whiteboard",
    id: string,
    groupId?: string
  ) => void;
  onEditingNameChange: (name: string) => void;
  onEditingEmojiChange: (emoji: string) => void;
  onCreateWhiteboard: (groupId: string) => void;
}

export function GroupItem({
  group,
  editingItem,
  editingName,
  editingEmoji,
  onToggleExpansion,
  onStartEditing,
  onCancelEditing,
  onSaveEdit,
  onDeleteItem,
  onEditingNameChange,
  onEditingEmojiChange,
  onCreateWhiteboard
}: GroupItemProps) {
  const groupInputRef = useRef<HTMLInputElement>(null);
  const [isDisabled, setIsDisabled] = useState(false);

  const queryClient = useQueryClient();
  const saveDrawGroup = useMutation({
    mutationFn: () => updateDrawGroup({
      name: editingName,
      id: group.id,
    }),
    onSuccess: () => {
      toast.success('编辑成功');
      onSaveEdit()
      queryClient.invalidateQueries({ queryKey: ['drawGroups'] }); // 触发重新获取
    },
    onError: () => {
      toast.error('编辑失败，请稍后重试');
    },
  });

  const deleteDrawGroupItem = useMutation({
    mutationFn: () => deleteDrawGroup(group.id),
    onSuccess: () => {
      toast.success('删除成功');
      queryClient.invalidateQueries({ queryKey: ['drawGroups'] }); // 触发重新获取
    },
    onError: () => {
      toast.error('删除失败，请稍后重试');
    },
  });

  const handleSaveEdit = () => {
    if (!editingName.trim()) {
      onSaveEdit()
    } else {
      setIsDisabled(true);
      saveDrawGroup.mutate();
    }
  }

  useEffect(() => {
    if (editingItem?.type === "group" && editingItem.id === group.id) {
      setIsDisabled(false);
      groupInputRef.current?.focus();
    }
  }, [editingItem, group.id]);

  return (
    <div className="space-y-1">
      {/* 分组头部 */}
      <div className="flex items-center justify-between  hover:bg-gray-50 rounded-lg group">
        <div
          className="flex items-center gap-2 flex-1 cursor-pointer py-1"
          onClick={() => onToggleExpansion(group.id)}
        >
          {group.isExpanded ? (
            <FolderOpen className="h-4 w-4 text-gray-500" /> // 修改图标
          ) : (
            <Folder className="h-4 w-4 text-gray-500" /> // 修改图标
          )}
          {editingItem?.type === "group" && editingItem.id === group.id ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                ref={groupInputRef}
                defaultValue={group.name}
                onChange={(e) => onEditingNameChange(e.target.value)}
                className="flex-1 h-6 px-1 text-sm"
                disabled={isDisabled}
                onBlur={handleSaveEdit}
                onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                autoFocus
              />
            </div>
          ) : (
            <>
              <span className="text-sm font-medium text-gray-700">
                {group.name}
              </span>
              <span className="text-xs text-gray-500">
                ({group.whiteboards.length})
              </span>
            </>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onCreateWhiteboard(group.id)}>
              <Plus className="h-3 w-3 mr-2" />
              新建白板
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStartEditing("group", group.id)}>
              <Edit3 className="h-3 w-3 mr-2" />
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => deleteDrawGroupItem.mutate()}
              className="text-red-600"
            >
              <Trash2 className="h-3 w-3 mr-2" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 白板列表 */}
      {group.isExpanded && (
        <div className="ml-6 space-y-1">
          {group.whiteboards.map((whiteboard) => (
            <DrawItem
              key={whiteboard.id}
              whiteboard={whiteboard}
              groupId={group.id}
              editingItem={editingItem}
              editingName={editingName}
              editingEmoji={editingEmoji}
              onStartEditing={onStartEditing}
              onCancelEditing={onCancelEditing}
              onSaveEdit={onSaveEdit}
              onDeleteItem={onDeleteItem}
              onEditingNameChange={onEditingNameChange}
              onEditingEmojiChange={onEditingEmojiChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}