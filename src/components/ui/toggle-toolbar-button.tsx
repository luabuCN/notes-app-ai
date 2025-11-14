'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';

import {
  useToggleToolbarButton,
  useToggleToolbarButtonState,
} from '@platejs/toggle/react';
import { ListCollapseIcon } from 'lucide-react';

import { ToolbarButton } from './toolbar';

export function ToggleToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const state = useToggleToolbarButtonState();
  const { props: buttonProps } = useToggleToolbarButton(state);
  const t = useTranslations('editor');

  return (
    <ToolbarButton {...props} {...buttonProps} tooltip={t('toolbar.toggle')}>
      <ListCollapseIcon />
    </ToolbarButton>
  );
}
