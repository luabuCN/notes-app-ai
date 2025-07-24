import React, { useState } from 'react';
import {
  Edit3,
  Trash2,
  MoreHorizontal,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { WhiteboardItem } from './types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { group } from 'console';
import { toast } from 'sonner';
import { deleteDrawGroup } from '../_action/use-delete-draw-group';
import { createDraw } from '../_action/use-create-draw';
import { updateDraw } from '../_action/use-update-draw';
import { deleteDraw } from '../_action/use-delete-draw';

interface WhiteboardItemProps {
  whiteboard: WhiteboardItem;
  groupId: string;
  editingItem: { type: 'group' | 'whiteboard', id: string, groupId?: string, isCreate: boolean } | null;
  editingName: string;
  editingEmoji: string;
  onStartEditing: (type: 'group' | 'whiteboard', id: string, groupId?: string) => void;
  onSaveEdit: () => void;
  onCancelEditing: () => void;
  onDeleteItem: (type: 'group' | 'whiteboard', id: string, groupId?: string) => void;
  onEditingNameChange: (name: string) => void;
  onEditingEmojiChange: (emoji: string) => void;
}

export function DrawItem({
  whiteboard,
  groupId,
  editingItem,
  editingName,
  editingEmoji,
  onStartEditing,
  onCancelEditing,
  onSaveEdit,
  onDeleteItem,
  onEditingNameChange,
  onEditingEmojiChange,
}: WhiteboardItemProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const queryClient = useQueryClient();

  const createNewDraw = useMutation({
    mutationFn: () => createDraw({ title: editingName, groupId, data: {}, emoji: editingEmoji }),
    onSuccess: () => {
      toast.success('创建成功');
      queryClient.invalidateQueries({ queryKey: ['drawGroups'] });
    },
    onError: () => {
      toast.error('创建失败，请稍后重试');
    },
  });

  const updateDrawBaseData = useMutation({
    mutationFn: () => updateDraw({
      title: editingName,
      emoji: editingEmoji,
      id: whiteboard.id,
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

  const deleteDrawItem = useMutation({
    mutationFn: () => deleteDraw(whiteboard.id),
    onSuccess: () => {
      toast.success('删除成功');
      queryClient.invalidateQueries({ queryKey: ['drawGroups'] }); // 触发重新获取
    },
    onError: () => {
      toast.error('删除失败，请稍后重试');
    },
  });

  const handleEmojiSelect = (emoji: any) => {
    onEditingEmojiChange(emoji.native);
    setShowEmojiPicker(false);
  };

  const handleSaveEdit = () => {
    if (!editingName.trim()) return onSaveEdit();
    if (editingItem?.isCreate) return createNewDraw.mutate();
    updateDrawBaseData.mutate();
  }

  return (
    <div className="flex items-center justify-between hover:bg-gray-50 rounded-lg group">
      {editingItem?.type === 'whiteboard' && editingItem.id === whiteboard.id ? (
        <div className="flex items-center gap-2 flex-1 py-1">
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="w-8 h-6 text-center p-0 border-0 bg-transparent hover:bg-gray-100"
                onClick={() => setShowEmojiPicker(true)}
              >
                {editingEmoji || '😀'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" side="bottom" align="start">
              <Picker
                data={data}
                onEmojiSelect={handleEmojiSelect}
                theme="light"
                previewPosition="none"
                skinTonePosition="none"
              />
            </PopoverContent>
          </Popover>
          <Input
            defaultValue={whiteboard.title}
            onChange={(e) => onEditingNameChange(e.target.value)}
            className="flex-1 h-6 px-1 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveEdit();
              if (e.key === 'Escape') onCancelEditing();
            }}
            autoFocus
          />
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-green-600 hover:bg-green-50"
              onClick={handleSaveEdit}
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-red-600 hover:bg-red-50"
              onClick={onCancelEditing}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-1 cursor-pointer">
          <span className="text-lg">{whiteboard.emoji}</span>
          <div>
            <p className="text-sm font-medium text-gray-700">{whiteboard.title}</p>
            <p className="text-xs text-gray-500">
              {whiteboard.updatedAt.toLocaleDateString()}
            </p>
          </div>
        </div>
      )}

      {!(editingItem?.type === 'whiteboard' && editingItem.id === whiteboard.id) && (
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
            <DropdownMenuItem onClick={() => onStartEditing('whiteboard', whiteboard.id, groupId)}>
              <Edit3 className="h-3 w-3 mr-2" />
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => deleteDrawItem.mutate()}
              className="text-red-600"
            >
              <Trash2 className="h-3 w-3 mr-2" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}