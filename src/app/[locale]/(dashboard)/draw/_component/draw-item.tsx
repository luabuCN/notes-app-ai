import React from 'react';
import {
  Edit3,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { WhiteboardItem } from './types';

interface WhiteboardItemProps {
  whiteboard: WhiteboardItem;
  groupId: string;
  editingItem: { type: 'group' | 'whiteboard', id: string, groupId?: string } | null;
  editingName: string;
  editingEmoji: string;
  onStartEditing: (type: 'group' | 'whiteboard', id: string, groupId?: string) => void;
  onSaveEdit: () => void;
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
  onSaveEdit,
  onDeleteItem,
  onEditingNameChange,
  onEditingEmojiChange,
}: WhiteboardItemProps) {
  return (
    <div className="flex items-center justify-between hover:bg-gray-50 rounded-lg group"> 
      {editingItem?.type === 'whiteboard' && editingItem.id === whiteboard.id ? (
        <div className="flex items-center gap-2 flex-1">
          <Input
            value={editingEmoji}
            onChange={(e) => onEditingEmojiChange(e.target.value)}
            className="w-8 h-6 text-center p-0 border-0 bg-transparent"
            maxLength={2}
          />
          <Input
            value={editingName}
            onChange={(e) => onEditingNameChange(e.target.value)}
            className="flex-1 h-6 px-1 text-sm"
            onBlur={onSaveEdit}
            onKeyDown={(e) => e.key === 'Enter' && onSaveEdit()}
            autoFocus
          />
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-1 cursor-pointer">
          <span className="text-lg">{whiteboard.emoji}</span>
          <div>
            <p className="text-sm font-medium text-gray-700">{whiteboard.name}</p>
            <p className="text-xs text-gray-500">
              {whiteboard.updatedAt.toLocaleDateString()}
            </p>
          </div>
        </div>
      )}
      
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
            onClick={() => onDeleteItem('whiteboard', whiteboard.id, groupId)}
            className="text-red-600"
          >
            <Trash2 className="h-3 w-3 mr-2" />
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}