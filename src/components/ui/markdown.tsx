import { marked } from "marked"
import { memo, useId, useMemo } from "react"
import { Markdown as LobehubMarkdown, MarkdownProps as LobehubMarkdownProps } from '@lobehub/ui';

export type MarkdownProps = {
  children: string
  id?: string
  className?: string
}

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown)
  return tokens.map((token) => token.raw)
}

const MemoizedMarkdownBlock = memo(
  function MarkdownBlock({
    content,
  }: {
    content: string
  }) {

    const options: LobehubMarkdownProps =
    {
      allowHtml: true,
      fontSize: 16,
      children: content,
      fullFeaturedCodeBlock: true,
      headerMultiple: 0.25,
      lineHeight: 1.4,
      marginMultiple: 1,
    }

    return (
      <LobehubMarkdown {...options} />
    )
  }
)

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock"

function MarkdownComponent({
  children,
  id,
  className,
}: MarkdownProps) {
  const generatedId = useId()
  const blockId = id ?? generatedId
  const blocks = useMemo(() => parseMarkdownIntoBlocks(children), [children])

  return (
    <div className={className}>
      {blocks.map((block, index) => (
        <MemoizedMarkdownBlock
          key={`${blockId}-block-${index}`}
          content={block}
        />
      ))}
    </div>
  )
}

const Markdown = memo(MarkdownComponent)
Markdown.displayName = "Markdown"

export { Markdown }
