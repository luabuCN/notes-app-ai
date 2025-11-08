import { marked } from "marked"
import { memo, useId, useMemo } from "react"
import { Markdown as LobehubMarkdown, MarkdownProps as LobehubMarkdownProps } from '@lobehub/ui';

export type MarkdownProps = {
  children: string
  id?: string
  className?: string
}

// List of valid HTML tags that React recognizes
const VALID_HTML_TAGS = new Set([
  'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'big', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'menu', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'slot', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr'
])

/**
 * Sanitizes HTML content by escaping invalid HTML tags
 * This prevents React from trying to render invalid tags like <user> as HTML elements
 */
function sanitizeHtml(content: string): string {
  // Match HTML tags (opening, closing, and self-closing)
  // Pattern matches: <tag>, </tag>, <tag/>, <tag attr="value">
  return content.replace(/<(\/?)([a-zA-Z][a-zA-Z0-9-]*)(\s[^>]*?)?(\/?)>/g, (match, closingSlash, tagName, attributes, selfClosing) => {
    const lowerTagName = tagName.toLowerCase()
    // If it's a valid HTML tag, keep it as is
    if (VALID_HTML_TAGS.has(lowerTagName)) {
      return match
    }
    // Otherwise, escape it so it's displayed as text
    const attrs = attributes || ''
    const selfClose = selfClosing || ''
    return `&lt;${closingSlash}${tagName}${attrs}${selfClose}&gt;`
  })
}

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const sanitized = sanitizeHtml(markdown)
  const tokens = marked.lexer(sanitized)
  return tokens.map((token) => token.raw)
}

const MemoizedMarkdownBlock = memo(
  function MarkdownBlock({
    content,
  }: {
    content: string
  }) {
    // Sanitize content again before rendering to ensure invalid HTML tags are escaped
    const sanitizedContent = sanitizeHtml(content)

    const options: LobehubMarkdownProps =
    {
      allowHtml: true,
      fontSize: 16,
      children: sanitizedContent,
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
