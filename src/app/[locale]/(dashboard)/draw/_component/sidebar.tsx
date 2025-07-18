import React, { useState } from 'react';
import { 
  Folder,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WhiteboardGroup, WhiteboardItem, DeletedItem } from './types';
import { GroupItem } from './group-item';

export function DrawSidebar() {
  const [groups, setGroups] = useState<WhiteboardGroup[]>([
    {
      id: '1',
      name: '工作项目',
      emoji: '💼',
      isExpanded: true,
      whiteboards: [
        { id: '1-1', name: '产品原型设计', emoji: '🎨', createdAt: new Date(), updatedAt: new Date() },
        { id: '1-2', name: '系统架构图', emoji: '🏗️', createdAt: new Date(), updatedAt: new Date() },
      ]
    },
    {
      id: '2',
      name: '个人笔记',
      emoji: '📝',
      isExpanded: false,
      whiteboards: [
        { id: '2-1', name: '学习计划', emoji: '📚', createdAt: new Date(), updatedAt: new Date() },
      ]
    }
  ]);
  
  const [deletedItems, setDeletedItems] = useState<DeletedItem[]>([]);
  const [editingItem, setEditingItem] = useState<{ type: 'group' | 'whiteboard', id: string, groupId?: string } | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingEmoji, setEditingEmoji] = useState('');
  // 新建白板 - 移到组内操作
  const createNewWhiteboard = (groupId: string) => {
    const newWhiteboard: WhiteboardItem = {
      id: Date.now().toString(),
      name: '新白板',
      emoji: '📄',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setGroups(prev => prev.map(group => 
      group.id === groupId
        ? { ...group, whiteboards: [...group.whiteboards, newWhiteboard] }
        : group
    ));
  };

  const createNewGroup = () => {
    const newGroup: WhiteboardGroup = {
      id: Date.now().toString(),
      name: '新分组',
      emoji: '📁',
      isExpanded: true,
      whiteboards: []
    };
    setGroups(prev => [...prev, newGroup]);
  };

  const toggleGroupExpansion = (groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, isExpanded: !group.isExpanded }
        : group
    ));
  };

  const startEditing = (type: 'group' | 'whiteboard', id: string, groupId?: string) => {
    const item = type === 'group' 
      ? groups.find(g => g.id === id)
      : groups.find(g => g.id === groupId)?.whiteboards.find(w => w.id === id);
    
    if (item) {
      setEditingItem({ type, id, groupId });
      setEditingName(item.name);
      setEditingEmoji(item.emoji);
    }
  };

  const saveEdit = () => {
    if (!editingItem) return;
    
    if (editingItem.type === 'group') {
      setGroups(prev => prev.map(group => 
        group.id === editingItem.id
          ? { ...group, name: editingName, emoji: editingEmoji }
          : group
      ));
    } else {
      setGroups(prev => prev.map(group => 
        group.id === editingItem.groupId
          ? {
              ...group,
              whiteboards: group.whiteboards.map(wb => 
                wb.id === editingItem.id
                  ? { ...wb, name: editingName, emoji: editingEmoji, updatedAt: new Date() }
                  : wb
              )
            }
          : group
      ));
    }
    
    setEditingItem(null);
    setEditingName('');
    setEditingEmoji('');
  };

  const deleteItem = (type: 'group' | 'whiteboard', id: string, groupId?: string) => {
    if (type === 'group') {
      const group = groups.find(g => g.id === id);
      if (group) {
        const deletedItem: DeletedItem = {
          id: group.id,
          name: group.name,
          emoji: group.emoji,
          type: 'group',
          deletedAt: new Date(),
          originalData: group
        };
        setDeletedItems(prev => [...prev, deletedItem]);
        setGroups(prev => prev.filter(g => g.id !== id));
      }
    } else {
      const group = groups.find(g => g.id === groupId);
      const whiteboard = group?.whiteboards.find(w => w.id === id);
      if (whiteboard) {
        const deletedItem: DeletedItem = {
          id: whiteboard.id,
          name: whiteboard.name,
          emoji: whiteboard.emoji,
          type: 'whiteboard',
          deletedAt: new Date(),
          originalData: whiteboard
        };
        setDeletedItems(prev => [...prev, deletedItem]);
        setGroups(prev => prev.map(group => 
          group.id === groupId
            ? { ...group, whiteboards: group.whiteboards.filter(w => w.id !== id) }
            : group
        ));
      }
    }
  };

  return (
    <div className="w-full h-full bg-white border-gray-200 flex flex-col">
      <div className="border-gray-200 mb-4">
       <Button
          onClick={createNewGroup}
          variant="ghost"
          size="sm"
          className="w-full justify-start px-2 py-1.5 h-auto text-sm font-normal text-gray-600 hover:bg-gray-100"
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
                onSaveEdit={saveEdit}
                onDeleteItem={deleteItem}
                onEditingNameChange={setEditingName}
                onEditingEmojiChange={setEditingEmoji}
                onCreateWhiteboard={createNewWhiteboard}
              />
            ))}
            
            {groups.length === 0 && (
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