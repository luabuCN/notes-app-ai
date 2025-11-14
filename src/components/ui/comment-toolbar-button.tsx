'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';

import { MessageSquareTextIcon } from 'lucide-react';
import { useEditorRef } from 'platejs/react';

import { commentPlugin } from '@/components/editor/comment-kit';

import { ToolbarButton } from './toolbar';

export function CommentToolbarButton() {
  const editor = useEditorRef();
  const t = useTranslations('editor');

  return (
    <ToolbarButton
      onClick={() => {
        editor.getTransforms(commentPlugin).comment.setDraft();
      }}
      data-plate-prevent-overlay
      tooltip={t('toolbar.comment')}
    >
      <MessageSquareTextIcon />
    </ToolbarButton>
  );
}
