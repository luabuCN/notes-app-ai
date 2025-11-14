'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';

import { insertInlineEquation } from '@platejs/math';
import { RadicalIcon } from 'lucide-react';
import { useEditorRef } from 'platejs/react';

import { ToolbarButton } from './toolbar';

export function InlineEquationToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const editor = useEditorRef();
  const t = useTranslations('editor');

  return (
    <ToolbarButton
      {...props}
      onClick={() => {
        insertInlineEquation(editor);
      }}
      tooltip={t('toolbar.equation')}
    >
      <RadicalIcon />
    </ToolbarButton>
  );
}
