import {
  FileUpload,
  FileUploadContent,
  FileUploadTrigger,
} from "@/components/ui/file-upload"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import React from "react"
import { FileUp, Paperclip } from "lucide-react"
type ButtonFileUploadProps = {
  onFileUpload: (files: File[]) => void
}

export function ButtonFileUpload({
  onFileUpload,
}: ButtonFileUploadProps) {
  return (
    <FileUpload
      onFilesAdded={onFileUpload}
      multiple
      accept=".txt,.md,image/jpeg,image/png,image/gif,image/webp,image/svg,image/heic,image/heif"
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <FileUploadTrigger asChild>
            <Button
              size="sm"
              variant="secondary"
              className={cn(
                "border-border dark:bg-secondary size-9 rounded-full border bg-transparent",
              )}
              type="button"
              aria-label="添加文件"
            >
              <Paperclip className="size-4" />
            </Button>
          </FileUploadTrigger>
        </TooltipTrigger>
        <TooltipContent>添加文件</TooltipContent>
      </Tooltip>
      <FileUploadContent>
        <div className="border-input bg-background flex flex-col items-center rounded-lg border border-dashed p-8">
          <FileUp className="text-muted-foreground size-8" />
          <span className="mt-4 mb-1 text-lg font-medium">拖拽文件到此处</span>
          <span className="text-muted-foreground text-sm">
            将任意文件拖拽到此处以添加到对话
          </span>
        </div>
      </FileUploadContent>
    </FileUpload>
  )
}
