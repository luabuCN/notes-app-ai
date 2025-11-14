'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';

import {
  useLinkToolbarButton,
  useLinkToolbarButtonState,
} from '@platejs/link/react';
import { Link } from 'lucide-react';

import { ToolbarButton } from './toolbar';

export function LinkToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const state = useLinkToolbarButtonState();
  const { props: buttonProps } = useLinkToolbarButton(state);
  const t = useTranslations('editor');

  return (
    <ToolbarButton {...props} {...buttonProps} data-plate-focus tooltip={t('toolbar.link')}>
      <Link />
    </ToolbarButton>
  );
}
