import { create } from 'zustand';
import { WhiteboardGroup, WhiteboardItem, DeletedItem } from './types';

type CurrentDraw=Required<Omit<WhiteboardItem, 'createdAt' | 'userId' | 'isDeleted'>> | null;
interface DrawStore {
  // 当前选择
  currentDraw:CurrentDraw;

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
  editingItem: { type: 'group' | 'whiteboard', id: string, groupId?: string, isCreate: boolean } | null;
  editingName: string;
  editingEmoji: string;
  setEditingItem: (item: { type: 'group' | 'whiteboard', id: string, groupId?: string, isCreate: boolean } | null) => void;
  setEditingName: (name: string) => void;
  setEditingEmoji: (emoji: string) => void;

  // 其他操作函数
  setCurrentDraw: (draw:CurrentDraw)=>void
  createNewWhiteboard: (groupId: string) => void;
  createNewGroup: () => void;
  toggleGroupExpansion: (groupId: string,isExpanded:boolean) => void;
  startEditing: (type: 'group' | 'whiteboard', id: string, groupId?: string, isCreate?: boolean) => void;
  cancelEditing: () => void;
  saveEdit: () => void;
  deleteItem: (type: 'group' | 'whiteboard', id: string, groupId?: string) => void;
}

export const useDrawStore = create<DrawStore>((set, get) => ({
  currentDraw:null,

  // 弹窗状态
  showAddGroupDialog: false,
  setShowAddGroupDialog: (show) => set({ showAddGroupDialog: show }),

  // 组数据
  groups: [],
  setGroups: (newGroups) => set((state) => ({
    groups: newGroups.map(newGroup => {
      const oldGroup = state.groups.find(g => g.id === newGroup.id);
      return {
        ...newGroup,
        isExpanded: oldGroup?.isExpanded ?? false, // 默认不展开
      };
    }),
  })),

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
          ? { ...group, whiteboards: [...group.whiteboards, newWhiteboard], isExpanded: true }
          : group
      )
    }));

    get().startEditing('whiteboard', newWhiteboard.id, groupId, true);
  },

  // 新建组
  createNewGroup: () => {
    set({ showAddGroupDialog: true });
  },

  // 切换组展开状态
  toggleGroupExpansion: (groupId,isExpanded) => {
    set((state) => ({
      groups: state.groups.map(group =>
        group.id === groupId
          ? { ...group, isExpanded: isExpanded }
          : group
      )
    }));
  },

  // 开始编辑
  startEditing: (type, id, groupId, isCreate) => {
    const { groups } = get();

    if (type === 'group') {
      const group = groups.find(g => g.id === id);
      if (group) {
        set({
          editingItem: { type, id, groupId, isCreate: isCreate ?? false },
          editingName: group.name,
          editingEmoji: ''
        });
      }
    } else {
      const group = groups.find(g => g.id === groupId);
      const whiteboard = group?.whiteboards.find(w => w.id === id);
      if (whiteboard) {
        set({
          editingItem: { type, id, groupId, isCreate: isCreate ?? false },
          editingName: whiteboard.title,
          editingEmoji: whiteboard.emoji
        });
      }
    }
  },

  // 取消编辑
  cancelEditing: () => {
    const { editingItem, groups } = get();

    if (editingItem?.isCreate) {
      if (editingItem.type === 'whiteboard') {
        const updatedGroups = groups.map(group =>
          group.id === editingItem.groupId
            ? {
              ...group,
              whiteboards: group.whiteboards.filter(wb => wb.id !== editingItem.id),
            }
            : group
        );
        console.log(updatedGroups);
        set({ groups: updatedGroups });
      }
    }

    set({
      editingItem: null,
      editingName: '',
      editingEmoji: '',
    });
  },

  // 保存编辑
  saveEdit: () => {
    const { editingItem } = get();
    if (!editingItem) return;
    set((state) => ({
      editingItem: null,
      editingName: '',
      editingEmoji: ''
    }));
  },

  setCurrentDraw: (draw: CurrentDraw) => {
    console.log(draw);
    
    set((state) => ({
        currentDraw:draw?{...draw}:state.currentDraw, 
    }));
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