export interface WhiteboardItem {
  id: string;
  name: string;
  emoji: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WhiteboardGroup {
  id: string;
  name: string;
  emoji: string;
  whiteboards: WhiteboardItem[];
  isExpanded: boolean;
}

export interface DeletedItem {
  id: string;
  name: string;
  emoji: string;
  type: 'whiteboard' | 'group';
  deletedAt: Date;
  originalData: WhiteboardItem | WhiteboardGroup;
}