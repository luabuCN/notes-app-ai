export interface WhiteboardItem {
  id: string;
  title: string;
  emoji: string;
  version: number;
  isDeleted?: boolean;
  data?: any;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
  groupId: string;
}

export interface WhiteboardGroup {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  whiteboards: WhiteboardItem[];
  isExpanded: boolean;
}

export interface DeletedItem {
  id: string;
  type: 'whiteboard' | 'group';
  deletedAt: Date;
  originalData: WhiteboardItem | WhiteboardGroup;
}