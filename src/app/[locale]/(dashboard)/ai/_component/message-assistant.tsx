import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
} from "@/components/ui/message";
import { cn } from "@/lib/utils";
import { getSources } from "./get-sources";
import { SourcesList } from "./sources-list";
import { Check, Copy, RotateCw } from "lucide-react";

type MessageAssistantProps = {
  children: string;
  isLast?: boolean;
  hasScrollAnchor?: boolean;
  copied?: boolean;
  copyToClipboard?: () => void;
  onReload?: () => void;
  parts?: any[];
  status?: "streaming" | "ready" | "submitted" | "error";
  className?: string;
};

export function MessageAssistant({
  children,
  isLast,
  hasScrollAnchor,
  copied,
  copyToClipboard,
  onReload,
  parts,
  status,
  className,
}: MessageAssistantProps) {
  const sources = getSources(parts || []);
  const toolInvocationParts = parts?.filter(
    (part) => part.type === "tool-invocation"
  );
  const reasoningParts = parts?.find((part) => part.type === "reasoning");
  const textPart = parts?.find((part) => part.type === "text");
  const actualContent = textPart?.text || children;
  const contentNullOrEmpty = actualContent === null || actualContent === "";
  const isLastStreaming = status === "streaming" && isLast;

  return (
    <Message
      className={cn(
        "group flex w-full max-w-6xl flex-1 items-start gap-4 px-6 pb-2",
        hasScrollAnchor && "min-h-scroll-anchor",
        className
      )}
    >
     

      <div className={cn("flex min-w-full flex-col gap-2", isLast && "pb-8")}>
        {reasoningParts && reasoningParts.reasoning && (
          <div className="text-sm text-muted-foreground italic p-3 bg-muted/50 rounded-lg">
            <strong>Reasoning:</strong> {reasoningParts.reasoning}
          </div>
        )}

        {toolInvocationParts && toolInvocationParts.length > 0 && (
          <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
            <strong>Tool Usage:</strong> {toolInvocationParts.length} tool(s) invoked
          </div>
        )}

        {contentNullOrEmpty ? null : (
          <MessageContent
            className={cn(
              "prose dark:prose-invert relative min-w-full bg-transparent p-0",
              "prose-h1:scroll-m-20 prose-h1:text-2xl prose-h1:font-semibold prose-h2:mt-8 prose-h2:scroll-m-20 prose-h2:text-xl prose-h2:mb-3 prose-h2:font-medium prose-h3:scroll-m-20 prose-h3:text-base prose-h3:font-medium prose-h4:scroll-m-20 prose-h5:scroll-m-20 prose-h6:scroll-m-20 prose-strong:font-medium prose-table:block prose-table:overflow-y-auto"
            )}
            markdown={true}
          >
            {actualContent}
          </MessageContent>
        )}

        {sources && sources.length > 0 && <SourcesList sources={sources} />}

        {Boolean(isLastStreaming || contentNullOrEmpty) ? null : (
          <MessageActions
            className={cn(
              "-ml-2 flex gap-0 opacity-0 transition-opacity group-hover:opacity-100"
            )}
          >
            <MessageAction
              tooltip={copied ? "Copied!" : "Copy text"}
              side="bottom"
            >
              <button
                className="hover:bg-accent/60 text-muted-foreground hover:text-foreground flex size-7.5 items-center justify-center rounded-full bg-transparent transition"
                aria-label="Copy text"
                onClick={copyToClipboard}
                type="button"
              >
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
            </MessageAction>
            {isLast ? (
              <MessageAction
                tooltip="Regenerate"
                side="bottom"
                delayDuration={0}
              >
                <button
                  className="hover:bg-accent/60 text-muted-foreground hover:text-foreground flex size-7.5 items-center justify-center rounded-full bg-transparent transition"
                  aria-label="Regenerate"
                  onClick={onReload}
                  type="button"
                >
                  <RotateCw className="size-4" />
                </button>
              </MessageAction>
            ) : null}
          </MessageActions>
        )}
      </div>
    </Message>
  );
}
