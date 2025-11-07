import type { ChatRequestOptions, FileUIPart, UIDataTypes, UIMessage, UITools } from "ai";

export type FileAttachment = {
  file: File;
  preview?: string;
  uploading: boolean;
  url?: string;
  error?: string;
};

export type SendMessage = (
  message?:
    | (Omit<UIMessage<unknown, UIDataTypes, UITools>, 'id' | 'role'> & {
        id?: string;
        role?: 'user' | 'assistant' | 'system';
        text?: never;
        files?: never;
        messageId?: string;
      })
    | {
        text: string;
        files?: FileList | FileUIPart[];
        metadata?: unknown;
        parts?: never;
        messageId?: string;
      }
    | {
        files: FileList | FileUIPart[];
        metadata?: unknown;
        parts?: never;
        messageId?: string;
      },
  options?: ChatRequestOptions
) => Promise<void>;