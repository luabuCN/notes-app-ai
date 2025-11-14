'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import {
  CalendarIcon,
  ChevronRightIcon,
  Columns3Icon,
  FileCodeIcon,
  FilmIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ImageIcon,
  Link2Icon,
  ListIcon,
  ListOrderedIcon,
  MinusIcon,
  PenToolIcon,
  PilcrowIcon,
  PlusIcon,
  QuoteIcon,
  RadicalIcon,
  SquareIcon,
  TableIcon,
  TableOfContentsIcon,
} from 'lucide-react';
import { KEYS } from 'platejs';
import { type PlateEditor, useEditorRef } from 'platejs/react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  insertBlock,
  insertInlineElement,
} from '@/components/editor/transforms';

import { ToolbarButton, ToolbarMenuGroup } from './toolbar';

type Group = {
  group: string;
  items: Item[];
};

interface Item {
  icon: React.ReactNode;
  value: string;
  onSelect: (editor: PlateEditor, value: string) => void;
  focusEditor?: boolean;
  label?: string;
}

const groups: Group[] = [
  {
    group: 'basicBlocks',
    items: [
      {
        icon: <PilcrowIcon />,
        label: 'paragraph',
        value: KEYS.p,
      },
      {
        icon: <Heading1Icon />,
        label: 'heading1',
        value: 'h1',
      },
      {
        icon: <Heading2Icon />,
        label: 'heading2',
        value: 'h2',
      },
      {
        icon: <Heading3Icon />,
        label: 'heading3',
        value: 'h3',
      },
      {
        icon: <TableIcon />,
        label: 'table',
        value: KEYS.table,
      },
      {
        icon: <FileCodeIcon />,
        label: 'code',
        value: KEYS.codeBlock,
      },
      {
        icon: <QuoteIcon />,
        label: 'quote',
        value: KEYS.blockquote,
      },
      {
        icon: <MinusIcon />,
        label: 'divider',
        value: KEYS.hr,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: 'lists',
    items: [
      {
        icon: <ListIcon />,
        label: 'bulletedList',
        value: KEYS.ul,
      },
      {
        icon: <ListOrderedIcon />,
        label: 'numberedList',
        value: KEYS.ol,
      },
      {
        icon: <SquareIcon />,
        label: 'todoList',
        value: KEYS.listTodo,
      },
      {
        icon: <ChevronRightIcon />,
        label: 'toggleList',
        value: KEYS.toggle,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: 'media',
    items: [
      {
        icon: <ImageIcon />,
        label: 'image',
        value: KEYS.img,
      },
      {
        icon: <FilmIcon />,
        label: 'embed',
        value: KEYS.mediaEmbed,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: 'advancedBlocks',
    items: [
      {
        icon: <TableOfContentsIcon />,
        label: 'toc',
        value: KEYS.toc,
      },
      {
        icon: <Columns3Icon />,
        label: 'threeColumns',
        value: 'action_three_columns',
      },
      {
        focusEditor: false,
        icon: <RadicalIcon />,
        label: 'equation',
        value: KEYS.equation,
      },
      {
        icon: <PenToolIcon />,
        label: 'excalidraw',
        value: KEYS.excalidraw,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: 'inline',
    items: [
      {
        icon: <Link2Icon />,
        label: 'link',
        value: KEYS.link,
      },
      {
        focusEditor: true,
        icon: <CalendarIcon />,
        label: 'date',
        value: KEYS.date,
      },
      {
        focusEditor: false,
        icon: <RadicalIcon />,
        label: 'inlineEquation',
        value: KEYS.inlineEquation,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertInlineElement(editor, value);
      },
    })),
  },
];

export function InsertToolbarButton(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const [open, setOpen] = React.useState(false);
  const t = useTranslations('editor');

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip={t('toolbar.insert')} isDropdown>
          <PlusIcon />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="flex max-h-[500px] min-w-0 flex-col overflow-y-auto"
        align="start"
      >
        {groups.map(({ group, items: nestedItems }) => (
          <ToolbarMenuGroup key={group} label={t(`insert.groups.${group}`)}>
            {nestedItems.map(({ icon, label, value, onSelect }) => (
              <DropdownMenuItem
                key={value}
                className="min-w-[180px]"
                onSelect={() => {
                  onSelect(editor, value);
                  editor.tf.focus();
                }}
              >
                {icon}
                {t(`insert.items.${label}`)}
              </DropdownMenuItem>
            ))}
          </ToolbarMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
