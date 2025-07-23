import { create } from 'zustand';
import { WhiteboardGroup, WhiteboardItem, DeletedItem } from './types';

interface DrawStore {
  // 弹窗状态
  showAddGroupDialog: boolean;
  setShowAddGroupDialog: (show: boolean) => void;
  
  // 组数据
  groups: WhiteboardGroup[];
  setGroups: (groups: WhiteboardGroup[]) => void;
  addGroup: (group: WhiteboardGroup) => void;
  
  // 删除的项目
  deletedItems: DeletedItem[];
  setDeletedItems: (items: DeletedItem[]) => void;
  
  // 编辑状态
  editingItem: { type: 'group' | 'whiteboard', id: string, groupId?: string } | null;
  editingName: string;
  editingEmoji: string;
  setEditingItem: (item: { type: 'group' | 'whiteboard', id: string, groupId?: string } | null) => void;
  setEditingName: (name: string) => void;
  setEditingEmoji: (emoji: string) => void;
  
  // 创建组的处理函数
  createGroup: (groupData: Omit<WhiteboardGroup, 'id' | 'createdAt' | 'updatedAt' | 'whiteboards' | 'isExpanded'>) => void;
  
  // 其他操作函数
  createNewWhiteboard: (groupId: string) => void;
  createNewGroup: () => void;
  handleCreateGroup: (groupData: Omit<WhiteboardGroup, 'id' | 'createdAt' | 'updatedAt' | 'whiteboards' | 'isExpanded'>) => void;
  toggleGroupExpansion: (groupId: string) => void;
  startEditing: (type: 'group' | 'whiteboard', id: string, groupId?: string) => void;
  saveEdit: () => void;
  deleteItem: (type: 'group' | 'whiteboard', id: string, groupId?: string) => void;
}

export const useDrawStore = create<DrawStore>((set, get) => ({
  // 弹窗状态
  showAddGroupDialog: false,
  setShowAddGroupDialog: (show) => set({ showAddGroupDialog: show }),
  
  // 组数据
  groups: [
    {
      id: '1',
      name: '工作项目',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user1',
      isExpanded: true,
      whiteboards: [
        { id: '1-1', title: '产品原型设计', emoji: '🎨', version: 1, isDeleted: false, data: {}, createdAt: new Date(), updatedAt: new Date(), groupId: '1' },
        { id: '1-2', title: '系统架构图', emoji: '🏗️', version: 1, isDeleted: false, data: {}, createdAt: new Date(), updatedAt: new Date(), groupId: '1' },
      ]
    },
    {
      id: '2',
      name: '个人笔记',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user1',
      isExpanded: false,
      whiteboards: [
        { id: '2-1', title: '学习计划', emoji: '📚', version: 1, isDeleted: false, data: {}, createdAt: new Date(), updatedAt: new Date(), groupId: '2' },
      ]
    }
  ],
  setGroups: (groups) => set({ groups }),
  addGroup: (group) => set((state) => ({ groups: [...state.groups, group] })),
  
  // 删除的项目
  deletedItems: [],
  setDeletedItems: (items) => set({ deletedItems: items }),
  
  // 编辑状态
  editingItem: null,
  editingName: '',
  editingEmoji: '',
  setEditingItem: (item) => set({ editingItem: item }),
  setEditingName: (name) => set({ editingName: name }),
  setEditingEmoji: (emoji) => set({ editingEmoji: emoji }),
  
  // 创建组的处理函数
  createGroup: (groupData) => {
    const newGroup: WhiteboardGroup = {
      id: Date.now().toString(),
      ...groupData,
      createdAt: new Date(),
      updatedAt: new Date(),
      isExpanded: true,
      whiteboards: []
    };
    
    const { addGroup, setShowAddGroupDialog } = get();
    addGroup(newGroup);
    setShowAddGroupDialog(false);
  },
  
  // 新建白板
  createNewWhiteboard: (groupId) => {
    const newWhiteboard: WhiteboardItem = {
      id: Date.now().toString(),
      title: '新白板',
      emoji: '📄',
      version: 1,
      isDeleted: false,
      data: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      groupId: groupId
    };
    
    set((state) => ({
      groups: state.groups.map(group => 
        group.id === groupId
          ? { ...group, whiteboards: [...group.whiteboards, newWhiteboard] }
          : group
      )
    }));
  },
  
  // 新建组
  createNewGroup: () => {
    set({ showAddGroupDialog: true });
  },
  
  // 处理创建组
  handleCreateGroup: (groupData) => {
    const { createGroup } = get();
    createGroup(groupData);
  },
  
  // 切换组展开状态
  toggleGroupExpansion: (groupId) => {
    set((state) => ({
      groups: state.groups.map(group => 
        group.id === groupId 
          ? { ...group, isExpanded: !group.isExpanded }
          : group
      )
    }));
  },
  
  // 开始编辑
  startEditing: (type, id, groupId) => {
    const { groups } = get();
    
    if (type === 'group') {
      const group = groups.find(g => g.id === id);
      if (group) {
        set({
          editingItem: { type, id, groupId },
          editingName: group.name,
          editingEmoji: ''
        });
      }
    } else {
      const group = groups.find(g => g.id === groupId);
      const whiteboard = group?.whiteboards.find(w => w.id === id);
      if (whiteboard) {
        set({
          editingItem: { type, id, groupId },
          editingName: whiteboard.title,
          editingEmoji: whiteboard.emoji
        });
      }
    }
  },
  
  // 保存编辑
  saveEdit: () => {
    const { editingItem, editingName, editingEmoji } = get();
    if (!editingItem) return;
    
    if (editingItem.type === 'group') {
      set((state) => ({
        groups: state.groups.map(group => 
          group.id === editingItem.id
            ? { ...group, name: editingName, updatedAt: new Date() }
            : group
        ),
        editingItem: null,
        editingName: '',
        editingEmoji: ''
      }));
    } else {
      set((state) => ({
        groups: state.groups.map(group => 
          group.id === editingItem.groupId
            ? {
                ...group,
                whiteboards: group.whiteboards.map(wb => 
                  wb.id === editingItem.id
                    ? { ...wb, title: editingName, emoji: editingEmoji, updatedAt: new Date() }
                    : wb
                )
              }
            : group
        ),
        editingItem: null,
        editingName: '',
        editingEmoji: ''
      }));
    }
  },
  
  // 删除项目
  deleteItem: (type, id, groupId) => {
    const { groups, deletedItems } = get();
    
    if (type === 'group') {
      const group = groups.find(g => g.id === id);
      if (group) {
        const deletedItem: DeletedItem = {
          id: group.id,
          type: 'group',
          deletedAt: new Date(),
          originalData: group
        };
        
        set((state) => ({
          deletedItems: [...state.deletedItems, deletedItem],
          groups: state.groups.filter(g => g.id !== id)
        }));
      }
    } else {
      const group = groups.find(g => g.id === groupId);
      const whiteboard = group?.whiteboards.find(w => w.id === id);
      if (whiteboard) {
        const deletedItem: DeletedItem = {
          id: whiteboard.id,
          type: 'whiteboard',
          deletedAt: new Date(),
          originalData: whiteboard
        };
        
        set((state) => ({
          deletedItems: [...state.deletedItems, deletedItem],
          groups: state.groups.map(group => 
            group.id === groupId
              ? { ...group, whiteboards: group.whiteboards.filter(w => w.id !== id) }
              : group
          )
        }));
      }
    }
  },
}));